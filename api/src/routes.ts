export function injectRoutes(app) {
  app.use("/alerte-message", require("./controllers/dashboard/alerte-message").default);
  app.use("/application", require("./application/applicationController"));
  app.use("/bus", require("./controllers/bus"));
  app.use("/cohesion-center", require("./cohesionCenter").default);
  app.use("/cohort", require("./cohort/cohortController"));
  app.use("/cohort-group", require("./cohortGroup/cohortGroupController").default);
  app.use("/cohort-session", require("./controllers/cohort-session").default);
  app.use("/contract", require("./controllers/contract").default);
  app.use("/correction-request", require("./controllers/correction-request").default);
  app.use("/dashboard/engagement", require("./controllers/dashboard/engagement"));
  app.use("/demande-de-modification", require("./controllers/planDeTransport/demande-de-modification"));
  app.use("/department-service", require("./controllers/department-service"));
  app.use("/edit-transport", require("./controllers/planDeTransport/edit-transport").default);
  app.use("/elasticsearch", require("./controllers/elasticsearch").default);
  app.use("/email", require("./controllers/email").default);
  app.use("/event", require("./controllers/event"));
  app.use("/filters", require("./controllers/filters").default);
  app.use("/gouv.fr", require("./controllers/gouv.fr"));
  app.use("/inscription-goal", require("./controllers/inscription-goal").default);
  app.use("/ligne-de-bus", require("./planDeTransport/ligneDeBus/ligneDeBusController"));
  app.use("/ligne-to-point", require("./controllers/planDeTransport/ligne-to-point").default);
  app.use("/mission", require("./controllers/mission").default);
  app.use("/plan-marketing", require("./plan-marketing").default);
  app.use("/plan-de-transport/import", require("./controllers/planDeTransport/import").default);
  app.use("/point-de-rassemblement", require("./planDeTransport/pointDeRassemblement").default);
  app.use("/program", require("./controllers/program").default);
  app.use("/referent", require("./referent/referentController").default);
  app.use("/representants-legaux", require("./controllers/representants-legaux"));
  app.use("/schema-de-repartition", require("./controllers/planDeTransport/schema-de-repartition"));
  app.use("/session-phase1", require("./controllers/session-phase1"));
  app.use("/signin", require("./controllers/signin"));
  app.use("/structure", require("./controllers/structure").default);
  app.use("/table-de-repartition", require("./controllers/planDeTransport/table-de-repartition").default);
  app.use("/tags", require("./controllers/tags"));
  app.use("/waiting-list", require("./controllers/waiting-list"));
  app.use("/young", require("./controllers/young/index").default);
  app.use("/young", require("./young/youngController").default);
  app.use("/young-edition", require("./young/edition/youngEditionController").default);
  app.use("/SNUpport", require("./controllers/SNUpport").default);
  app.use("/cle", require("./cle").default);
  app.use("/preinscription", require("./preinscription/preinscriptionController"));
  app.use("/filter-label", require("./filterLabel/filterLabelController"));
  app.use("/email-preview", require("./controllers/emailPreview").default);

  //services
  app.use("/jeveuxaider", require("./services/jeveuxaider"));
}
