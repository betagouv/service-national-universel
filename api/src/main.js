console.time("http");
const http = require("http");
console.timeEnd("http");

console.time("bodyParser");
const bodyParser = require("body-parser");
console.timeEnd("bodyParser");

console.time("cors");
const cors = require("cors");
console.timeEnd("cors");

console.time("events");
const events = require("events");
console.timeEnd("events");

console.time("cookieParser");
const cookieParser = require("cookie-parser");
console.timeEnd("cookieParser");

console.time("helmet");
const helmet = require("helmet");
console.timeEnd("helmet");

console.time("passport");
const passport = require("passport");
console.timeEnd("passport");

console.time("validateCustomHeader");
const validateCustomHeader = require("./middlewares/validateCustomHeader");
console.timeEnd("validateCustomHeader");

console.time("loggingMiddleware");
const loggingMiddleware = require("./middlewares/loggingMiddleware");
console.timeEnd("loggingMiddleware");

console.time("forcedomain");
const { forceDomain } = require("forcedomain");
console.timeEnd("forcedomain");

console.time("request-ip");
const requestIp = require("request-ip"); // Import request-ip package
console.timeEnd("request-ip");

console.time("express");
const express = require("express");
console.timeEnd("express");

console.time("@godaddy/terminus");
const { createTerminus } = require("@godaddy/terminus");
console.timeEnd("@godaddy/terminus");

console.time("config");
const config = require("config");
console.timeEnd("config");

console.time("logger");
const { logger } = require("./logger");
console.timeEnd("logger");

console.time("sentry");
const { capture } = require("./sentry");
const { setupExpressErrorHandler } = require("@sentry/node");
console.timeEnd("sentry");

console.time("mongo");
const { initDB, closeDB } = require("./mongo");
console.timeEnd("mongo");

console.time("redis");
const { initRedisClient, closeRedisClient } = require("./redis");
console.timeEnd("redis");

console.time("pdf-renderer");
const { getAllPdfTemplates } = require("./utils/pdf-renderer");
console.timeEnd("pdf-renderer");

console.time("passport-init");
const { initPassport } = require("./passport");
console.timeEnd("passport-init");

console.time("routes");
const { injectRoutes } = require("./routes");
console.timeEnd("routes");

console.time("migration");
const { runMigrations } = require("./migration");
console.timeEnd("migration");

console.time("express-basic-auth");
const basicAuth = require("express-basic-auth");
console.timeEnd("express-basic-auth");

console.time("redisQueue");
const { initMonitor, initQueues, closeQueues, initWorkers, closeWorkers, scheduleRepeatableTasks } = require("./queues/redisQueue");
console.timeEnd("redisQueue");

async function runTasks() {
  await Promise.all([initDB(), getAllPdfTemplates()]);

  initQueues();
  initWorkers();
  await scheduleRepeatableTasks();

  const app = express();

  if (config.get("TASK_MONITOR_ENABLE_AUTH")) {
    app.use(
      basicAuth({
        challenge: true,
        users: {
          [config.get("TASK_MONITOR_USER")]: config.get("TASK_MONITOR_SECRET"),
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

async function runAPI() {
  if (config.ENVIRONMENT !== "test") {
    logger.info(`API_URL ${config.API_URL}`);
    logger.info(`APP_URL ${config.APP_URL}`);
    logger.info(`ADMIN_URL ${config.ADMIN_URL}`);
    logger.info(`SUPPORT_URL ${config.SUPPORT_URL}`);
    logger.info(`SUPPORT_FRONT_URL ${config.SUPPORT_FRONT_URL}`);
    logger.info(`KNOWLEDGEBASE_URL ${config.KNOWLEDGEBASE_URL}`);
    logger.info(`ANALYTICS_URL ${config.API_ANALYTICS_ENDPOINT}`);
  }

  await Promise.all([initDB(), initRedisClient()]);

  /*
    Download all certificate templates when instance is starting,
    making them available for PDF generation

    These templates are sensitive data, so we can't treat them as simple statics

    TODO : A possible improvement would be to download templates at build time
  */
  getAllPdfTemplates();
  initQueues();

  const app = express();
  app.use(helmet());

  if (["production", "staging", "ci", "custom"].includes(config.ENVIRONMENT)) {
    const url = new URL(config.API_URL);
    app.use(
      forceDomain({
        hostname: url.hostname,
        protocol: "https",
      }),
    );
  }

  // eslint-disable-next-line no-unused-vars
  function handleError(err, req, res, next) {
    const output = {
      error: {
        name: err.name,
        message: err.message,
        text: err.toString(),
      },
    };
    const statusCode = err.status || 500;
    res.status(statusCode).json(output);
  }

  const origin = [config.APP_URL, config.ADMIN_URL, config.SUPPORT_URL, config.SUPPORT_FRONT_URL, config.KNOWLEDGEBASE_URL, "https://inscription.snu.gouv.fr"];

  app.use(
    cors({
      credentials: true,
      origin,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage", "x-user-timezone"],
    }),
  );

  //Check custom header
  app.use(validateCustomHeader);

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.text({ limit: "50mb", type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  app.use(function (req, res, next) {
    req.ipInfo = requestIp.getClientIp(req);
    next();
  });
  app.use(loggingMiddleware);

  app.use(cookieParser());

  app.use(express.static(__dirname + "/../public"));

  app.use(passport.initialize());

  injectRoutes(app);

  app.get("/memory-stats", async (req, res) => {
    // ! Memory usage
    const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

    const memoryData = process.memoryUsage();

    const memoryUsage = {
      rss: `Resident Set Size (rss): ${formatMemoryUsage(memoryData.rss)}`,
      heapTotal: `Total Heap Size (heapTotal): ${formatMemoryUsage(memoryData.heapTotal)}`,
      heapUsed: `Used Heap Size (heapUsed): ${formatMemoryUsage(memoryData.heapUsed)}`,
      external: `External Memory (external): ${formatMemoryUsage(memoryData.external)}`,
    };

    let response = "Memory usage:<br>";
    Object.entries(memoryUsage).forEach(([, value]) => {
      response += `${value}<br>`;
    });

    response += "<br>Explications :<br>";
    response +=
      "La taille du jeu de résidence (rss) représente la taille totale de la mémoire allouée pour l'exécution du processus. Cela inclut la mémoire utilisée par le code du programme, les variables et les bibliothèques chargées en mémoire.<br>";
    response +=
      "La taille totale du tas (heapTotal) indique la taille totale de la mémoire allouée pour le tas (heap). Le tas est une zone de mémoire utilisée pour stocker les objets et les données dynamiques du programme.<br>";
    response +=
      "La taille du tas utilisée (heapUsed) représente la quantité réelle de mémoire utilisée dans le tas (heap) pendant l'exécution du programme. Cela inclut la mémoire allouée pour les objets et les données utilisées par le programme.<br>";
    response +=
      "La mémoire externe (external) correspond à la quantité de mémoire utilisée par des ressources externes au moteur JavaScript, telles que les liaisons avec des bibliothèques natives ou des objets créés en dehors de l'environnement JavaScript.<br>";

    res.status(200).send(response);
  });

  app.get("/error_for_baleen", async (req, res) => {
    res.status(403).send("SNU TEST");
  });

  app.get("/", async (req, res) => {
    const d = new Date();
    res.status(200).send("SNU " + d.toLocaleString());
  });

  app.get("/testsentry", async (req, res) => {
    try {
      throw new Error("Intentional error");
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: "hihi" });
    }
  });

  if (config.ENVIRONMENT !== "production") {
    app.get("/test_error_double_res_send", (req, res) => {
      res.send("TEST ERROR");
      res.send("TEST ERROR 2");
    });

    app.get("/test_error_crash_app", (req, res) => {
      try {
        setTimeout(function () {
          throw new Error("PM2 TEST ERROR CRASH APP");
        }, 10);
      } catch (e) {
        logger.error(`error ${e}`);
      }
    });
  }

  setupExpressErrorHandler(app);
  app.use(handleError);

  initPassport();

  // * Use Terminus for graceful shutdown when using Docker
  const server = http.createServer(app);

  function onSignal() {
    logger.debug("server is starting cleanup");
    return Promise.all([closeDB(), closeRedisClient(), closeQueues()]);
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

  await runMigrations();
}

module.exports = {
  runAPI,
  runTasks,
};
