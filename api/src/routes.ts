export function injectRoutes(app) {
  app.use("/alerte-message", require("./controllers/dashboard/alerte-message"));
  app.use("/application", require("./controllers/application"));
  app.use("/bus", require("./controllers/bus"));
  app.use("/cle/referent", require("./controllers/cle/referent"));
  app.use("/cle/referent-signup", require("./controllers/cle/referent-signup"));
  app.use("/cle/young", require("./controllers/cle/young"));
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
  app.use("/cle", require("./cle"));

  //services
  app.use("/jeveuxaider", require("./services/jeveuxaider"));
}
