const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

function getAppHelper() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/referent", require("../../controllers/referent"));
  app.use("/young", require("../../controllers/young"));
  app.use("/mission", require("../../controllers/mission"));
  return app;
}

module.exports = getAppHelper;
