const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("passport");
const validateCustomHeader = require("./middlewares/validateCustomHeader");
const loggingMiddleware = require("./middlewares/loggingMiddleware");
const { forceDomain } = require("forcedomain");
const requestIp = require("request-ip"); // Import request-ip package
const express = require("express");
const { createTerminus } = require("@godaddy/terminus");

const { config } = require("./config");
const { logger } = require("./logger");

const { setupExpressErrorHandler } = require("@sentry/node");

const { initDB, closeDB } = require("./mongo");
const { initRedisClient, closeRedisClient } = require("./redis");
const { initVirusScanner } = require("./utils/virusScanner");
const { getAllPdfTemplates } = require("./utils/pdf-renderer");
const { initPassport } = require("./passport");
const { injectRoutes } = require("./routes");
const { runMigrations } = require("./migration");
const { applyBodyParsers, handleError } = require("./middlewares/httpHardening");

const { initQueues, closeQueues, initWorkers, closeWorkers } = require("./queues/redisQueue");

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

  await Promise.all([initDB(), initRedisClient(), initVirusScanner()]);

  /*
    Download all certificate templates when instance is starting,
    making them available for PDF generation

    These templates are sensitive data, so we can't treat them as simple statics

    TODO : A possible improvement would be to download templates at build time
  */
  getAllPdfTemplates();
  initQueues();

  const app = express();
  // Requis pour que req.ip désigne le client réel et non le reverse proxy :
  // sans cela, le rate limiting des routes d'auth compterait toutes les
  // requêtes sur une seule et même IP (ou se contournerait via X-Forwarded-For).
  app.set("trust proxy", config.TRUST_PROXY_HOPS);
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

  applyBodyParsers(app);

  app.use(function (req, res, next) {
    req.ipInfo = requestIp.getClientIp(req);
    next();
  });
  app.use(loggingMiddleware);

  app.use(cookieParser());

  app.use(express.static(__dirname + "/../public"));

  app.use(passport.initialize());

  injectRoutes(app);

  app.get("/", async (req, res) => {
    const d = new Date();
    res.status(200).send("SNU " + d.toLocaleString());
  });

  setupExpressErrorHandler(app);
  app.use(handleError);

  initPassport();

  // * Use Terminus for graceful shutdown
  const server = http.createServer(app);

  function onSignal() {
    logger.debug("server is starting cleanup");
    return Promise.all([closeDB(), closeRedisClient(), closeQueues(), closeWorkers()]);
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

  if (config.RUN_API_AND_TASKS) {
    await initWorkers();
  }
}

module.exports = {
  runAPI,
};
