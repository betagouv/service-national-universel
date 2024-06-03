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
  app.use("/point-de-rassemblement", require("../../controllers/planDeTransport/point-de-rassemblement"));
  app.use("/mission", require("../../controllers/mission"));
  app.use("/program", require("../../controllers/program"));
  app.use("/application", require("../../controllers/application"));
  app.use("/bus", require("../../controllers/bus"));
  app.use("/cohesion-center", require("../../controllers/cohesion-center"));
  app.use("/session-phase1", require("../../controllers/session-phase1"));
  app.use("/department-service", require("../../controllers/department-service"));
  app.use("/diagoriente", require("../../controllers/diagoriente"));
  app.use("/email", require("../../controllers/email"));
  app.use("/structure", require("../../controllers/structure"));
  app.use("/contract", require("../../controllers/contract"));
  app.use("/waiting-list", require("../../controllers/waiting-list"));
  app.use("/inscription-goal", require("../../controllers/inscription-goal"));
  app.use("/table-de-repartition", require("../../controllers/planDeTransport/table-de-repartition"));
  app.use("/ligne-to-point", require("../../controllers/planDeTransport/ligne-to-point"));
  app.use("/cle", require("../../controllers/cle"));
  app.use("/plan-de-transport", require("../../planDeTransport/planDeTransportController"));
  app.use("/ligne-de-bus", require("../../planDeTransport/ligneDeBus/ligneDeBusController"));

  return app;
}

module.exports = getAppHelper;
