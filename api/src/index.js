const validateCustomHeader = require("./middlewares/validateCustomHeader");

(async () => {
  await require("./env-manager")();

  // ! Ignore specific error
  const originalConsoleError = console.error;
  console.error = function (message) {
    if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
    originalConsoleError.apply(console, arguments);
  };

  const { initSentry, capture } = require("./sentry");

  require("events").EventEmitter.defaultMaxListeners = 30; // Fix warning node (Caused by ElasticMongoose-plugin)

  const bodyParser = require("body-parser");
  const cors = require("cors");
  const express = require("express");
  const cookieParser = require("cookie-parser");
  const helmet = require("helmet");
  const logger = require("morgan");
  const passport = require("passport");
  require("./mongo");

  const { PORT, APP_URL, ADMIN_URL, SUPPORT_URL, KNOWLEDGEBASE_URL, API_ANALYTICS_ENDPOINT, API_PDF_ENDPOINT, ENVIRONMENT } = require("./config.js");

  if (process.env.NODE_ENV !== "test") {
    console.log("APP_URL", APP_URL);
    console.log("ADMIN_URL", ADMIN_URL);
    console.log("SUPPORT_URL", SUPPORT_URL);
    console.log("KNOWLEDGEBASE_URL", KNOWLEDGEBASE_URL);
    console.log("ANALYTICS_URL", API_ANALYTICS_ENDPOINT);
    console.log("PDF_URL", API_PDF_ENDPOINT);
    console.log("ENVIRONMENT: ", ENVIRONMENT);
  }

  const app = express();
  const registerSentryErrorHandler = initSentry(app);
  app.use(helmet());

  // if (ENVIRONMENT === "development") {
  app.use(logger("dev"));
  // }

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

  require("./crons");
  app.use(cookieParser());

  app.use(express.static(__dirname + "/../public"));

  app.use(passport.initialize());

  app.use("/es", require("./controllers/es"));
  app.use("/mission", require("./controllers/mission"));
  app.use("/structure", require("./controllers/structure"));
  app.use("/young", require("./controllers/young/index"));
  app.use("/referent", require("./controllers/referent"));
  app.use("/application", require("./controllers/application"));
  app.use("/contract", require("./controllers/contract"));
  app.use("/program", require("./controllers/program"));
  app.use("/event", require("./controllers/event"));
  app.use("/inscription-goal", require("./controllers/inscription-goal"));
  app.use("/cohort-session", require("./controllers/cohort-session"));
  app.use("/department-service", require("./controllers/department-service"));
  app.use("/waiting-list", require("./controllers/waiting-list"));
  app.use("/cohesion-center", require("./controllers/cohesion-center"));
  app.use("/session-phase1", require("./controllers/session-phase1"));
  app.use("/email", require("./controllers/email"));
  app.use("/diagoriente", require("./controllers/diagoriente"));
  app.use("/bus", require("./controllers/bus"));
  app.use("/zammood", require("./controllers/zammood"));
  app.use("/signin", require("./controllers/signin"));
  app.use("/representants-legaux", require("./controllers/representants-legaux"));
  app.use("/correction-request", require("./controllers/correction-request"));
  app.use("/table-de-repartition", require("./controllers/planDeTransport/table-de-repartition"));
  app.use("/schema-de-repartition", require("./controllers/planDeTransport/schema-de-repartition"));
  app.use("/point-de-rassemblement", require("./controllers/planDeTransport/point-de-rassemblement"));
  app.use("/ligne-de-bus", require("./controllers/planDeTransport/ligne-de-bus"));
  app.use("/ligne-to-point", require("./controllers/planDeTransport/ligne-to-point"));
  app.use("/demande-de-modification", require("./controllers/planDeTransport/demande-de-modification"));
  app.use("/young-edition", require("./controllers/young-edition"));
  app.use("/tags", require("./controllers/tags"));
  app.use("/cohort", require("./controllers/cohort"));
  app.use("/filters", require("./controllers/filters"));
  app.use("/plan-de-transport/import", require("./controllers/planDeTransport/import"));
  app.use("/elasticsearch", require("./controllers/elasticsearch"));
  app.use("/dashboard/engagement", require("./controllers/dashboard/engagement"));
  app.use("/alerte-message", require("./controllers/dashboard/alerte-message"));
  app.use("/edit-transport", require("./controllers/planDeTransport/edit-transport"));
  app.use("/CLE", require("./controllers/CLE"));

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

  app.listen(PORT, () => console.log("Listening on port " + PORT));
})();
