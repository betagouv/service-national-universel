const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { injectRoutes } = require("../../routes");

function getAppHelper() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  injectRoutes(app);

  return app;
}

module.exports = getAppHelper;
