const http = require("http");
const express = require("express");
const { createTerminus } = require("@godaddy/terminus");

const { config } = require("./config");
const { logger } = require("./logger");

const { setupExpressErrorHandler } = require("@sentry/node");

const { initDB, closeDB } = require("./mongo");
const { getAllPdfTemplates } = require("./utils/pdf-renderer");

const basicAuth = require("express-basic-auth");
const { initMonitor, initQueues, closeQueues, initWorkers, closeWorkers, scheduleRepeatableTasks } = require("./queues/redisQueue");

async function runTasks() {
  await Promise.all([initDB(), getAllPdfTemplates()]);

  initQueues();
  initWorkers();
  await scheduleRepeatableTasks();

  const app = express();

  if (config.TASK_MONITOR_ENABLE_AUTH) {
    app.use(
      basicAuth({
        challenge: true,
        users: {
          [config.TASK_MONITOR_USER]: config.TASK_MONITOR_SECRET,
        },
      }),
    );
  }
  app.use("/", initMonitor());
  setupExpressErrorHandler(app);

  // * Use Terminus for graceful shutdown when using Docker
  const server = http.createServer(app);

  function onSignal() {
    logger.debug("server is starting cleanup");
    return Promise.all([closeDB(), closeQueues(), closeWorkers()]);
  }

  function onShutdown() {
    logger.debug("cleanup finished, server is shutting down");
  }

  function healthCheck({ state }) {
    return Promise.resolve();
  }

  const options = {
    healthChecks: {
      "/healthcheck": healthCheck,
    },
    onSignal,
    onShutdown,
  };

  createTerminus(server, options);

  server.listen(config.PORT, () => logger.debug(`Listening on port ${config.PORT}`));
}

module.exports = {
  runTasks,
};
