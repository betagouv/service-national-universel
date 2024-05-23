(async () => {
  await require("./env-manager")();

  const helmet = require("helmet");
  const bodyParser = require("body-parser");
  const express = require("express");
  const cors = require("cors");
  const { initSentry, capture } = require("./sentry");
  const { PORT } = require("./config");

  const app = express();

  const registerSentryErrorHandler = initSentry(app);

  app.use(helmet());
  app.use(helmet.hsts({ maxAge: 5184000 }));

  require("./crons");
  require("./services/databases/redis.service");

  // @todo: can it be removed?
  // ! Gérer ici la variable ?
  const origin = ["http://localhost:8085"];
  app.use(cors({ credentials: true, origin }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/", require("./controllers/health.controller"));
  app.use("/auth", require("./controllers/auth.controller"));
  app.use("/log", require("./controllers/log.controller"));
  app.use("/stats", require("./controllers/stats.controller"));

  app.get("/", async (req, res) => {
    try {
      res.status(200).send("OK");
    } catch (error) {
      capture(error);
    }
  });

  app.get("/testsentry", async () => {
    try {
      throw new Error("Intentional error");
    } catch (error) {
      capture(error);
    }
  });

  registerSentryErrorHandler();

  app.listen(PORT, () => console.info("Listening on port " + PORT));
})();
