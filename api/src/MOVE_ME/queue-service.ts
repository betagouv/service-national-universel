const { BullMonitorExpress } = require("@bull-monitor/express");
const { BullAdapter } = require("@bull-monitor/root/dist/bull-adapter");
const SendMailService = require("./send-mail-service"); // TODO: REMOVE_ME

const queues = [SendMailService.queue];

function initTaskQueues() {
  SendMailService.startWorker();
}

async function stopQueues() {
  return Promise.all(queues.map((q) => q.close()));
}

async function initTaskMonitor() {
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

module.exports = {
  initTaskQueues,
  initTaskMonitor,
  stopQueues,
};
