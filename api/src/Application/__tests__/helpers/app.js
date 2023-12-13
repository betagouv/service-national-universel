const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

function getAppHelper() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/referent", require("../../../Infrastructure/Controllers/referent"));
  app.use("/young", require("../../../Infrastructure/Controllers/Young"));
  app.use("/point-de-rassemblement", require("../../../Infrastructure/Controllers/PlanDeTransport/point-de-rassemblement"));
  app.use("/mission", require("../../../Infrastructure/Controllers/mission"));
  app.use("/program", require("../../../Infrastructure/Controllers/program"));
  app.use("/application", require("../../../Infrastructure/Controllers/application"));
  app.use("/bus", require("../../../Infrastructure/Controllers/bus"));
  app.use("/cohesion-center", require("../../../Infrastructure/Controllers/cohesion-center"));
  app.use("/session-phase1", require("../../../Infrastructure/Controllers/session-phase1"));
  app.use("/department-service", require("../../../Infrastructure/Controllers/department-service"));
  app.use("/diagoriente", require("../../../Infrastructure/Controllers/diagoriente"));
  app.use("/email", require("../../../Infrastructure/Controllers/email"));
  app.use("/structure", require("../../../Infrastructure/Controllers/structure"));
  app.use("/contract", require("../../../Infrastructure/Controllers/contract"));
  app.use("/waiting-list", require("../../../Infrastructure/Controllers/waiting-list"));
  app.use("/inscription-goal", require("../../../Infrastructure/Controllers/inscription-goal"));
  app.use("/es", require("../../../Infrastructure/Controllers/es"));
  app.use("/table-de-repartition", require("../../../Infrastructure/Controllers/PlanDeTransport/table-de-repartition"));
  app.use("/ligne-to-point", require("../../../Infrastructure/Controllers/PlanDeTransport/ligne-to-point"));
  app.use("/ligne-de-bus", require("../../../Infrastructure/Controllers/PlanDeTransport/ligne-de-bus"));

  return app;
}

module.exports = getAppHelper;
