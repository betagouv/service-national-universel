import config from "config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { initQueue, initWorker } from "./sendMailQueue";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const queues: Queue[] = [];
const workers: Worker[] = [];

function initRedisConnection() {
  const opts = {
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
  };
  return new Redis(config.get("REDIS_URL"), opts);
}

export function initQueues() {
  const connection = initRedisConnection();
  queues.push(initQueue(connection));
}

export async function closeQueues() {
  return Promise.all(queues.map((q) => q.close()));
}

export function initWorkers() {
  const connection = initRedisConnection();
  workers.push(initWorker(connection));
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
