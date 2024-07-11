const { BullMonitorExpress } = require("@bull-monitor/express");
const { BullAdapter } = require("@bull-monitor/root/dist/bull-adapter");
const SendMailService = require("./send-mail-service"); // TODO: REMOVE_ME

function initTaskQueues() {
  SendMailService.startWorker();
}

async function initTaskMonitor() {
  const monitor = new BullMonitorExpress({
    queues: [new BullAdapter(SendMailService.queue)],
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
};
