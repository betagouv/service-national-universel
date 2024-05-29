const { DASHBOARD_TODOS_FUNCTIONS, ES_NO_LIMIT, ROLES } = require("snu-lib");
const { buildArbitratyNdJson } = require("../../controllers/elasticsearch/utils");
const { esClient } = require("../../es");
const { queryFromFilter, withAggs, buildFilterContext } = require("./todo.helper");
const service = {};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_NOT_CONFIRMED] = async (user, { oneWeekBeforepdrChoiceLimitDate: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_NOT_CONFIRMED]: [] };

  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson(
      { index: "young", type: "_doc" },
      withAggs(
        queryFromFilter(user.role, user.region, user.department, [
          { terms: { "cohort.keyword": cohorts } },
          { exists: { field: "sessionId" } },
          { exists: { field: "lineId" } },
          { bool: { should: [{ term: { mettingPointId: "N/A" } }, { bool: { must_not: { exists: { field: "mettingPointId" } } } }], minimum_should_match: 1 } },
        ]),
        "cohort.keyword",
      ),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_NOT_CONFIRMED]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED] = async (user, { notStarted, assignementOpen }) => {
  const cohorts = notStarted.filter((e) => assignementOpen.includes(e));
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED]: [] };

  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson(
      { index: "young", type: "_doc" },
      withAggs(
        queryFromFilter(user.role, user.region, user.department, [
          {
            bool: {
              should: [{ term: { youngPhase1Agreement: "false" } }, { bool: { must_not: { exists: { field: "youngPhase1Agreement" } } } }],
              minimum_should_match: 1,
            },
          },
          { terms: { "cohort.keyword": cohorts } },
          { terms: { "status.keyword": ["VALIDATED"] } },
          { terms: { "statusPhase1.keyword": ["AFFECTED"] } },
        ]),
      ),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE] = async (user, { notStarted: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE]: [] };
  const departmentsCohortsFromRepartition = await service.departmentsFromTableRepartition(user, cohorts);
  // On récupère les points de rassemblement pour chaque cohorte groupés par département
  // Si un département de la cohorte n'a pas de point de rassemblement on l'ajoute dans la liste à signaler.
  const response = await esClient().msearch({
    index: "pointderassemblement",
    body: buildArbitratyNdJson(
      ...cohorts.flatMap((cohort) => {
        return [
          { index: "pointderassemblement", type: "_doc" },
          withAggs(
            queryFromFilter(user.role, user.region, user.department, [
              { terms: { "cohort.keyword": [cohort] } },
              { terms: { "department.keyword": departmentsCohortsFromRepartition.filter((e) => e.cohort === cohort).map((e) => e.fromDepartment) } },
            ]),
            "department.keyword",
          ),
        ];
      }),
    ),
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE]: service.missingElementsByCohortDepartment(response, departmentsCohortsFromRepartition, cohorts) };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE] = async (user, { sessionEditionOpen: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE]: [] };
  const departmentsCohortsFromRepartition = await service.departmentsFromTableRepartition(user, cohorts);
  // On récupère les entrées de session phase 1 pour chaque cohorte groupés par département
  const response = await esClient().msearch({
    index: "sessionphase1",
    body: buildArbitratyNdJson(
      ...cohorts.flatMap((cohort) => {
        return [
          { index: "sessionphase1", type: "_doc" },
          withAggs(
            queryFromFilter(user.role, user.region, user.department, [
              { terms: { "cohort.keyword": [cohort] } },
              { terms: { "department.keyword": departmentsCohortsFromRepartition.filter((e) => e.cohort === cohort).map((e) => e.fromDepartment) } },
            ]),
            "department.keyword",
          ),
        ];
      }),
    ),
  });
  // Pour chaque département, si le département n'a pas de session phase 1 pour la cohorte on l'ajoute dans la liste à signaler
  return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE]: service.missingElementsByCohortDepartment(response, departmentsCohortsFromRepartition, cohorts) };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.DOCS] = async (user, { twoWeeksBeforeSessionStart: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.SCHEDULE_NOT_UPLOADED]: [], [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PROJECT_NOT_UPLOADED]: [] };

  let filters = [{ terms: { "cohort.keyword": cohorts } }];

  if (user.role === ROLES.HEAD_CENTER) {
    let contextFilters = await buildFilterContext(user, cohorts, "sessionphase1");
    if (!contextFilters) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.SCHEDULE_NOT_UPLOADED]: [], [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PROJECT_NOT_UPLOADED]: [] };
    filters.push(contextFilters);
  }

  const response = await esClient().msearch({
    index: "sessionphase1",
    body: buildArbitratyNdJson(
      // Emploi du temps (À relancer) X emplois du temps n’ont pas été déposés pour le séjour de [Février 2023 -C].
      { index: "sessionphase1", type: "_doc" },
      withAggs(queryFromFilter(user.role, user.region, user.department, [...filters, { terms: { "hasTimeSchedule.keyword": ["false"] } }])),

      //Projet pédagogique (À relancer) X emplois du temps n’ont pas été déposés pour le séjour de [Février 2023 -C].
      { index: "sessionphase1", type: "_doc" },
      withAggs(queryFromFilter(user.role, user.region, user.department, [...filters, { terms: { "hasPedagoProject.keyword": ["false"] } }])),
    ),
  });
  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.SCHEDULE_NOT_UPLOADED]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PROJECT_NOT_UPLOADED]: response.body.responses[1].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL] = async (user, { sevenWeeksBeforeSessionStart: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL]: [] };
  const departmentsCohortsFromRepartition = await service.departmentsFromTableRepartition(user, cohorts);
  // On récupère les entrées de département service pour chaque cohorte groupés par département
  // Si un département de la cohorte n'a pas de contact on l'ajoute dans la liste à signaler.
  const response = await esClient().msearch({
    index: "departmentservice",
    body: buildArbitratyNdJson(
      ...cohorts.flatMap((cohort) => {
        return [
          { index: "departmentservice", type: "_doc" },
          withAggs(
            queryFromFilter(user.role, user.region, user.department, [
              {
                nested: {
                  path: "contacts",
                  query: {
                    bool: {
                      must: [{ terms: { "contacts.cohort.keyword": [cohort] } }],
                    },
                  },
                },
              },
              { terms: { "department.keyword": departmentsCohortsFromRepartition.filter((e) => e.cohort === cohort).map((e) => e.fromDepartment) } },
            ]),
            "department.keyword",
          ),
        ];
      }),
    ),
  });

  // Pour chaque département, si le département n'a pas de contact pour la cohorte on l'ajoute dans la liste à signaler
  return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL]: service.missingElementsByCohortDepartment(response, departmentsCohortsFromRepartition, cohorts) };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT] = async (user, { twoDaysAfterSessionStart: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT]: [] };
  let filters = [
    { terms: { "cohort.keyword": cohorts } },
    {
      bool: {
        should: [{ term: { ppsBeneficiary: "true" } }, { term: { paiBeneficiary: "true" } }, { term: { allergies: "true" } }, { term: { handicap: "true" } }],
        minimum_should_match: 1,
      },
    },
  ];

  if (user.role === ROLES.HEAD_CENTER) {
    let contextFilters = await buildFilterContext(user, cohorts, "young");
    if (!contextFilters) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT]: [] };
    filters.push(contextFilters);
  }

  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson({ index: "young", type: "_doc" }, withAggs(queryFromFilter(user.role, user.region, user.department, filters), "cohort.keyword")),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL] = async (user, { notStarted: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL]: [] };

  const response = await esClient().msearch({
    index: "sessionphase1",
    body: buildArbitratyNdJson(
      { index: "sessionphase1", type: "_doc" },
      withAggs(
        queryFromFilter(user.role, user.region, user.department, [{ terms: { "cohort.keyword": cohorts } }, { bool: { must_not: { exists: { field: "headCenterId" } } } }]),
        "cohort.keyword",
      ),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN] = async (user, { twoWeeksAfterSessionEnd: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN]: [] };
  let filters = [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }, { bool: { must_not: { exists: { field: "cohesionStayPresence.keyword" } } } }];
  if (user.role === ROLES.HEAD_CENTER) {
    let contextFilters = await buildFilterContext(user, cohorts, "young");
    if (!contextFilters) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN]: [] };
    filters.push(contextFilters);
  }
  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson(
      ...cohorts.flatMap((cohort) => {
        return [
          { index: "young", type: "_doc" },
          withAggs(queryFromFilter(user.role, user.region, user.department, [...filters, { terms: { "cohort.keyword": [cohort] } }]), "sessionPhase1Id.keyword"),
        ];
      }),
    ),
  });

  const checkin = [];
  for (let i = 0; i < response.body.responses.length; i++) {
    const r = response.body.responses[i];
    const cohort = cohorts[i];
    const sessionCount = r.aggregations.sessionPhase1Id.buckets.reduce((acc, e) => {
      if (e.doc_count > 0) acc++;
      return acc;
    }, 0);
    if (sessionCount > 0) {
      checkin.push({ cohort, count: sessionCount });
    }
  }
  return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN]: checkin };
};

service[DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MODIFICATION_REQUEST] = async (user, { notFinished: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MODIFICATION_REQUEST]: [] };

  const response = await esClient().msearch({
    index: "modificationbus",
    body: buildArbitratyNdJson(
      // Emploi du temps (À relancer) X emplois du temps n’ont pas été déposés pour le séjour de [Février 2023 -C].
      { index: "modificationbus", type: "_doc" },
      withAggs(queryFromFilter(user.role, user.region, user.department, [{ terms: { "cohort.keyword": cohorts } }, { terms: { "status.keyword": ["PENDING"] } }])),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MODIFICATION_REQUEST]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service.departmentsFromTableRepartition = async (user, cohorts) => {
  // Liste des départements de la table de répartition pour la personne qui regarde et les cohortes concernées
  const q = queryFromFilter(user.role, user.region, user.department, [{ terms: { "cohort.keyword": cohorts } }, { bool: { must: { exists: { field: "fromDepartment" } } } }], {
    regionField: "fromRegion",
    departmentField: "fromDepartment",
  });
  q.size = ES_NO_LIMIT;
  const responseRepartition = await esClient().msearch({
    index: "tablederepartition",
    body: buildArbitratyNdJson({ index: "tablederepartition", type: "_doc" }, q),
  });
  const departmentsCohortsFromRepartition = responseRepartition.body.responses[0].hits.hits.map((e) => e._source);
  return departmentsCohortsFromRepartition;
};

service.missingElementsByCohortDepartment = (response, departmentsCohortsFromRepartition, cohorts) => {
  const data = [];
  for (const cohort of cohorts) {
    const cohortDepartments = departmentsCohortsFromRepartition.filter((e) => e.cohort === cohort).map((e) => e.fromDepartment);
    // Chaque département doit avoir un contact pour la cohorte
    for (const department of cohortDepartments) {
      const cohortDepartmentsWithContact = response.body.responses.filter((e) => e.aggregations).find((e) => e.aggregations.department.buckets.find((e) => e.key === department));
      // Si le département n'a pas de session phase 1 pour la cohorte on l'ajoute dans la liste à signaler.
      if (!cohortDepartmentsWithContact) {
        if (!data.find((e) => e.cohort === cohort && e.department === department))
          data.push({
            cohort,
            department,
          });
      }
    }
  }
  return data;
};

module.exports = service;
