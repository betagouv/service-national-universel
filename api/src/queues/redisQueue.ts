import { BullMonitorExpress } from "@bull-monitor/express";
import { BullAdapter } from "@bull-monitor/root/dist/bull-adapter";
import sendMailQueue from "./sendMailQueue";
import Bull from "bull";

const queues: Bull.Queue[] = [];

export function initQueues() {
  queues.push(sendMailQueue.initQueue());
}

export function startQueues() {
  return sendMailQueue.startWorker();
}

export async function closeQueues() {
  return Promise.all(queues.map((q) => q.close()));
}

export async function initMonitor() {
  const monitor = new BullMonitorExpress({
    queues: queues.map((q) => new BullAdapter(q)),
    metrics: {
      collectInterval: { hours: 1 },
      maxMetrics: 100,
    },
  });
  await monitor.init();
  return monitor;
}
