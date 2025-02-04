export function injectRoutes(app) {
  app.use("/alerte-message", require("./controllers/dashboard/alerte-message"));
  app.use("/application", require("./controllers/application"));
  app.use("/bus", require("./controllers/bus"));
  app.use("/cohesion-center", require("./cohesionCenter").default);
  app.use("/cohort", require("./cohort/cohortController"));
  app.use("/cohort-group", require("./cohortGroup/cohortGroupController").default);
  app.use("/cohort-session", require("./controllers/cohort-session").default);
  app.use("/contract", require("./controllers/contract"));
  app.use("/correction-request", require("./controllers/correction-request").default);
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
  app.use("/inscription-goal", require("./controllers/inscription-goal").default);
  app.use("/ligne-de-bus", require("./planDeTransport/ligneDeBus/ligneDeBusController"));
  app.use("/ligne-to-point", require("./controllers/planDeTransport/ligne-to-point"));
  app.use("/mission", require("./controllers/mission"));
  app.use("/plan-de-transport/import", require("./controllers/planDeTransport/import").default);
  app.use("/point-de-rassemblement", require("./planDeTransport/pointDeRassemblement").default);
  app.use("/program", require("./controllers/program"));
  app.use("/referent", require("./referent/referentController").default);
  app.use("/representants-legaux", require("./controllers/representants-legaux"));
  app.use("/schema-de-repartition", require("./controllers/planDeTransport/schema-de-repartition"));
  app.use("/session-phase1", require("./controllers/session-phase1"));
  app.use("/signin", require("./controllers/signin"));
  app.use("/structure", require("./controllers/structure"));
  app.use("/table-de-repartition", require("./controllers/planDeTransport/table-de-repartition"));
  app.use("/tags", require("./controllers/tags"));
  app.use("/waiting-list", require("./controllers/waiting-list"));
  app.use("/young", require("./controllers/young/index").default);
  app.use("/young", require("./young/youngController").default);
  app.use("/young-edition", require("./young/edition/youngEditionController").default);
  app.use("/SNUpport", require("./controllers/SNUpport"));
  app.use("/cle", require("./cle").default);
  app.use("/preinscription", require("./preinscription/preinscriptionController"));
  app.use("/email-preview", require("./controllers/emailPreview").default);

  //services
  app.use("/jeveuxaider", require("./services/jeveuxaider"));
}
