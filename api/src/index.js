const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const events = require("events");

const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("passport");
const validateCustomHeader = require("./middlewares/validateCustomHeader");
const loggingMiddleware = require("./middlewares/loggingMiddleware");
const { forceDomain } = require("forcedomain");
const requestIp = require("request-ip"); // Import request-ip package
const express = require("express");
const { createTerminus } = require("@godaddy/terminus");

const { PORT, API_URL, APP_URL, ADMIN_URL, SUPPORT_URL, KNOWLEDGEBASE_URL, API_ANALYTICS_ENDPOINT, ENVIRONMENT } = require("./config");
const { initSentry, initSentryMiddlewares, capture } = require("./sentry");
const { initDB, closeDB } = require("./mongo");
const { getAllPdfTemplates } = require("./utils/pdf-renderer");
const { scheduleCrons } = require("./crons");
const { initPassport } = require("./passport");

// constrollers
const ctl_alerte_message = require("./controllers/dashboard/alerte-message");
const ctl_application = require("./controllers/application");
const ctl_bus = require("./controllers/bus");
const ctl_cle = require("./controllers/cle");
const ctl_cohesion_center = require("./controllers/cohesion-center");
const ctl_cohort = require("./controllers/cohort/cohort.controller");
const ctl_cohort_session = require("./controllers/cohort-session");
const ctl_contract = require("./controllers/contract");
const ctl_correction_request = require("./controllers/correction-request");
const ctl_dashboard_engagement = require("./controllers/dashboard/engagement");
const ctl_demande_de_modification = require("./controllers/planDeTransport/demande-de-modification");
const ctl_department_service = require("./controllers/department-service");
const ctl_diagoriente = require("./controllers/diagoriente");
const ctl_edit_transport = require("./controllers/planDeTransport/edit-transport");
const ctl_elasticsearch = require("./controllers/elasticsearch");
const ctl_email = require("./controllers/email");
const ctl_event = require("./controllers/event");
const ctl_filters = require("./controllers/filters");
const ctl_gouv_fr = require("./controllers/gouv.fr");
const ctl_inscription_goal = require("./controllers/inscription-goal");
const ctl_ligne_de_bus = require("./controllers/planDeTransport/ligne-de-bus");
const ctl_ligne_to_point = require("./controllers/planDeTransport/ligne-to-point");
const ctl_mission = require("./controllers/mission");
const ctl_pdt_import = require("./controllers/planDeTransport/import");
const ctl_point_de_rassemblement = require("./controllers/planDeTransport/point-de-rassemblement");
const ctl_program = require("./controllers/program");
const ctl_referent = require("./controllers/referent");
const ctl_representants_legaux = require("./controllers/representants-legaux");
const ctl_schema_de_repartition = require("./controllers/planDeTransport/schema-de-repartition");
const ctl_session_phase1 = require("./controllers/session-phase1");
const ctl_signin = require("./controllers/signin");
const ctl_structure = require("./controllers/structure");
const ctl_table_de_repartition = require("./controllers/planDeTransport/table-de-repartition");
const ctl_tags = require("./controllers/tags");
const ctl_waiting_list = require("./controllers/waiting-list");
const ctl_young = require("./controllers/young/index");
const ctl_young_edition = require("./controllers/young-edition");
const ctl_SNUpport = require("./controllers/SNUpport");
const ctl_classe = require("./classe/classe.controller");
//services
const svc_jeveuxaider = require("./services/jeveuxaider");

// process.on("unhandledRejection", (err) => {
//   console.error(err);
//   process.exit(1);
// });
async function main() {
  events.EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

  // ! Ignore specific error
  const originalConsoleError = console.error;
  console.error = function (message) {
    if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
    originalConsoleError.apply(console, arguments);
  };

  if (process.env.RUN_CRONS) {
    initSentry();
    await initDB();
    scheduleCrons();
    // Serverless containers requires running http server
    const app = express();
    app.listen(PORT, () => console.log("Listening on port " + PORT));
    return;
  }

  await require("./env-manager")();

  await initDB();

  /*
    Download all certificate templates when instance is starting,
    making them available for PDF generation

    These templates are sensitive data, so we can't treat theam as simple statics

    TODO : A possible improvement would be to download templates at build time
  */
  getAllPdfTemplates();

  if (ENVIRONMENT !== "testing") {
    console.log("API_URL", API_URL);
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

  if (['production', 'staging', 'ci', 'custom'].includes(ENVIRONMENT)) {
    const url = new URL(API_URL)
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
    scheduleCrons();
  }

  app.use(cookieParser());

  app.use(express.static(__dirname + "/../public"));

  app.use(passport.initialize());

  app.use("/alerte-message", ctl_alerte_message);
  app.use("/application", ctl_application);
  app.use("/bus", ctl_bus);
  app.use("/cle", ctl_cle);
  app.use("/cohesion-center", ctl_cohesion_center);
  app.use("/cohort", ctl_cohort);
  app.use("/cohort-session", ctl_cohort_session);
  app.use("/contract", ctl_contract);
  app.use("/correction-request", ctl_correction_request);
  app.use("/dashboard/engagement", ctl_dashboard_engagement);
  app.use("/demande-de-modification", ctl_demande_de_modification);
  app.use("/department-service", ctl_department_service);
  app.use("/diagoriente", ctl_diagoriente);
  app.use("/edit-transport", ctl_edit_transport);
  app.use("/elasticsearch", ctl_elasticsearch);
  app.use("/email", ctl_email);
  app.use("/event", ctl_event);
  app.use("/filters", ctl_filters);
  app.use("/gouv.fr", ctl_gouv_fr);
  app.use("/inscription-goal", ctl_inscription_goal);
  app.use("/ligne-de-bus", ctl_ligne_de_bus);
  app.use("/ligne-to-point", ctl_ligne_to_point);
  app.use("/mission", ctl_mission);
  app.use("/plan-de-transport/import", ctl_pdt_import);
  app.use("/point-de-rassemblement", ctl_point_de_rassemblement);
  app.use("/program", ctl_program);
  app.use("/referent", ctl_referent);
  app.use("/representants-legaux", ctl_representants_legaux);
  app.use("/schema-de-repartition", ctl_schema_de_repartition);
  app.use("/session-phase1", ctl_session_phase1);
  app.use("/signin", ctl_signin);
  app.use("/structure", ctl_structure);
  app.use("/table-de-repartition", ctl_table_de_repartition);
  app.use("/tags", ctl_tags);
  app.use("/waiting-list", ctl_waiting_list);
  app.use("/young", ctl_young);
  app.use("/young-edition", ctl_young_edition);
  app.use("/SNUpport", ctl_SNUpport);
  app.use("/classe", ctl_classe);

  //services
  app.use("/jeveuxaider", svc_jeveuxaider);

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

  if (ENVIRONMENT !== "production") {
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

  initPassport();

  // * Use Terminus for graceful shutdown when using Docker
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
};

main();
