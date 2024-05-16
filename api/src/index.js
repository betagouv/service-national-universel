(async () => {
  require("events").EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

  // ! Ignore specific error
  const originalConsoleError = console.error;
  console.error = function (message) {
    if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
    originalConsoleError.apply(console, arguments);
  };

  if (process.env.RUN_CRONS) {
    const { PORT } = require("./config");
    const { initSentry } = require("./sentry");
    initSentry();
    const { initDB } = require("./mongo");
    await initDB();
    require("./crons");
    // Serverless containers requires running http server
    const express = require("express");
    const app = express();
    app.listen(PORT, () => console.log("Listening on port " + PORT));
    return;
  }

  await require("./env-manager")();

  const { initSentryMiddlewares, capture } = require("./sentry");

  const bodyParser = require("body-parser");
  const cors = require("cors");

  const express = require("express");
  const cookieParser = require("cookie-parser");
  const helmet = require("helmet");
  const passport = require("passport");
  const validateCustomHeader = require("./middlewares/validateCustomHeader");
  const loggingMiddleware = require("./middlewares/loggingMiddleware");
  const { forceDomain } = require("forcedomain");
  const requestIp = require("request-ip"); // Import request-ip package
  const { initDB, closeDB } = require("./mongo");
  await initDB();

  const { PORT, APP_URL, ADMIN_URL, SUPPORT_URL, KNOWLEDGEBASE_URL, API_ANALYTICS_ENDPOINT, ENVIRONMENT } = require("./config");

  /*
    Download all certificate templates when instance is starting,
    making them available for PDF generation

    These templates are sensitive data, so we can't treat theam as simple statics

    TODO : A possible improvement would be to download templates at build time
  */
  const { getAllPdfTemplates } = require("./utils/pdf-renderer");
  getAllPdfTemplates();

  if (process.env.NODE_ENV !== "test") {
    console.log("APP_URL", APP_URL);
    console.log("ADMIN_URL", ADMIN_URL);
    console.log("SUPPORT_URL", SUPPORT_URL);
    console.log("KNOWLEDGEBASE_URL", KNOWLEDGEBASE_URL);
    console.log("ANALYTICS_URL", API_ANALYTICS_ENDPOINT);
    console.log("ENVIRONMENT: ", ENVIRONMENT);
  }

  const app = express();
  const registerSentryErrorHandler = initSentryMiddlewares(app);
  app.use(helmet());

  if (process.env.PRODUCTION) {
    app.use(
      forceDomain({
        hostname: "api.snu.gouv.fr",
        protocol: "https",
      }),
    );
  }

  if (process.env.STAGING && !process.env.CLE) {
    app.use(
      forceDomain({
        hostname: "api.beta-snu.dev",
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

  const origin = [APP_URL, ADMIN_URL, SUPPORT_URL, KNOWLEDGEBASE_URL, "https://inscription.snu.gouv.fr"];

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

  // WARNING : CleverCloud only
  if (process.env.RUN_CRONS_CC && ENVIRONMENT === "production" && process.env.CC_DEPLOYMENT_ID && process.env.INSTANCE_NUMBER === "0") {
    require("./crons");
  }

  app.use(cookieParser());

  app.use(express.static(__dirname + "/../public"));

  app.use(passport.initialize());

  app.use("/alerte-message", require("./controllers/dashboard/alerte-message"));
  app.use("/application", require("./controllers/application"));
  app.use("/bus", require("./controllers/bus"));
  app.use("/cle", require("./controllers/cle"));
  app.use("/cohesion-center", require("./controllers/cohesion-center"));
  app.use("/cohort", require("./cohort/cohortController"));
  app.use("/cohort-session", require("./controllers/cohort-session"));
  app.use("/contract", require("./controllers/contract"));
  app.use("/correction-request", require("./controllers/correction-request"));
  app.use("/dashboard/engagement", require("./controllers/dashboard/engagement"));
  app.use("/demande-de-modification", require("./controllers/planDeTransport/demande-de-modification"));
  app.use("/department-service", require("./controllers/department-service"));
  app.use("/diagoriente", require("./controllers/diagoriente"));
  app.use("/edit-transport", require("./controllers/planDeTransport/edit-transport"));
  app.use("/elasticsearch", require("./controllers/elasticsearch"));
  app.use("/email", require("./controllers/email"));
  app.use("/event", require("./controllers/event"));
  app.use("/filters", require("./controllers/filters"));
  app.use("/gouv.fr", require("./controllers/gouv.fr"));
  app.use("/inscription-goal", require("./controllers/inscription-goal"));
  app.use("/ligne-de-bus", require("./controllers/planDeTransport/ligne-de-bus"));
  app.use("/ligne-to-point", require("./controllers/planDeTransport/ligne-to-point"));
  app.use("/mission", require("./controllers/mission"));
  app.use("/plan-de-transport/import", require("./controllers/planDeTransport/import"));
  app.use("/point-de-rassemblement", require("./controllers/planDeTransport/point-de-rassemblement"));
  app.use("/program", require("./controllers/program"));
  app.use("/referent", require("./controllers/referent"));
  app.use("/representants-legaux", require("./controllers/representants-legaux"));
  app.use("/schema-de-repartition", require("./controllers/planDeTransport/schema-de-repartition"));
  app.use("/session-phase1", require("./controllers/session-phase1"));
  app.use("/signin", require("./controllers/signin"));
  app.use("/structure", require("./controllers/structure"));
  app.use("/table-de-repartition", require("./controllers/planDeTransport/table-de-repartition"));
  app.use("/tags", require("./controllers/tags"));
  app.use("/waiting-list", require("./controllers/waiting-list"));
  app.use("/young", require("./controllers/young/index"));
  app.use("/young-edition", require("./controllers/young-edition"));
  app.use("/SNUpport", require("./controllers/SNUpport"));
  app.use("/classe", require("./classe/classe.controller"));

  //services
  app.use("/jeveuxaider", require("./services/jeveuxaider"));

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
      console.log("Error ");
      capture(error);
      return res.status(500).send({ ok: false, code: "hihi" });
    }
  });

  if (process.env.STAGING === "true") {
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
        console.log("error", e);
      }
    });
  }

  registerSentryErrorHandler();
  app.use(handleError);

  require("./passport")();

  // * Use Terminus for graceful shutdown when using Docker
  const { createTerminus } = require("@godaddy/terminus");
  const http = require("http");

  const server = http.createServer(app);

  function onSignal() {
    console.log("server is starting cleanup");
    return Promise.all([closeDB()]);
  }

  function onShutdown() {
    console.log("cleanup finished, server is shutting down");
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

  server.listen(PORT, () => console.log("Listening on port " + PORT));
})();
