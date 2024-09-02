import config from "config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

import * as sendMailQueue from "./sendMailQueue";
import * as cronsQueue from "./cronsQueue";

const queues: Queue[] = [];
const workers: Worker[] = [];

export function initQueues() {
  const opts = {
    enableOfflineQueue: false,
  };
  const connection = new Redis(config.get("REDIS_URL"), opts);
  queues.push(sendMailQueue.initQueue(connection));
  if (config.get("RUN_CRONS")) {
    queues.push(cronsQueue.initQueue(connection));
  }
}

export async function scheduleRepeatableTasks() {
  if (config.get("RUN_CRONS")) {
    await cronsQueue.scheduleCrons();
  }
}

export async function closeQueues() {
  return Promise.all(queues.map((q) => q.close()));
}

export function initWorkers() {
  const opts = {
    maxRetriesPerRequest: null,
  };
  const connection = new Redis(config.get("REDIS_URL"), opts);
  workers.push(sendMailQueue.initWorker(connection));
  if (config.get("RUN_CRONS")) {
    workers.push(cronsQueue.initWorker(connection));
  }
}

export async function closeWorkers() {
  return Promise.all(workers.map((w) => w.close()));
}

export function initMonitor() {
  const serverAdapter = new ExpressAdapter();

  createBullBoard({
    queues: queues.map((q) => new BullMQAdapter(q)),
    serverAdapter: serverAdapter,
  });

  return serverAdapter.getRouter();
}
