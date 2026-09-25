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

function getTaskMonitorAuth() {
  const user = config.TASK_MONITOR_USER;
  const secret = config.TASK_MONITOR_SECRET;
  if (!user || !secret) return null;
  return { user, secret };
}

async function runTasks() {
  await Promise.all([initDB(), getAllPdfTemplates()]);

  initQueues();
  initWorkers();
  await scheduleRepeatableTasks();

  const app = express();

  // Bull Board affiche le contenu des jobs (emails, liens d'invitation, PII) et permet de les rejouer ou de
  // les supprimer. Il n'est monté que derrière une authentification ; sans identifiants configurés, il
  // n'est pas servi du tout (M12, audit du 21/09/2026 : il était public par défaut).
  const monitorAuth = getTaskMonitorAuth();
  if (monitorAuth) {
    app.use(basicAuth({ challenge: true, users: { [monitorAuth.user]: monitorAuth.secret } }), initMonitor());
  } else {
    logger.warn("Task monitor disabled: TASK_MONITOR_USER and TASK_MONITOR_SECRET are not set");
    app.get("/", (req, res) => res.status(200).send("SNU tasks"));
  }
  setupExpressErrorHandler(app);

  // * Use Terminus for graceful shutdown
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
  getTaskMonitorAuth,
};
