import { BullMonitorExpress } from "@bull-monitor/express";
import { BullAdapter } from "@bull-monitor/root/dist/bull-adapter";
import sendMailQueue from "./sendMailQueue";

const queues = [sendMailQueue.queue];

export function initTaskQueues() {
  sendMailQueue.startWorker();
}

export async function stopQueues() {
  return Promise.all(queues.map((q) => q.close()));
}

export async function initTaskMonitor() {
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
