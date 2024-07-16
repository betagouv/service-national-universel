import config from "config";
import { BullMonitorExpress } from "@bull-monitor/express";
import { BullAdapter } from "@bull-monitor/root/dist/bull-adapter";
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

export async function initMonitor() {
  const monitor = new BullMonitorExpress({
    queues: queues.map((q: any) => new BullAdapter(q)),
    metrics: {
      collectInterval: { hours: 1 },
      maxMetrics: 100,
    },
  });
  await monitor.init();
  return monitor;
}
