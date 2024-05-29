const { DASHBOARD_TODOS_FUNCTIONS, ROLES } = require("snu-lib");
const { buildArbitratyNdJson } = require("../../controllers/elasticsearch/utils");
const { esClient } = require("../../es");
const { queryFromFilter, withAggs, buildFilterContext } = require("./todo.helper");
const service = {};

service[DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.BASIC] = async (user, { notFinished: cohorts }) => {
  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson(
      // Dossier (À instruire) X dossiers d’inscriptions sont en attente de validation.
      // inscription_en_attente_de_validation
      { index: "young", type: "_doc" },
      queryFromFilter(user.role, user.region, user.department, [
        { terms: { "cohort.keyword": cohorts } },
        { terms: { "status.keyword": ["WAITING_VALIDATION"] } },
        { bool: { must_not: { exists: { field: "correctionRequests.keyword" } } } },
      ]),
      // Dossier (À instruire) X dossiers d’inscription corrigés sont à instruire de nouveau.
      // inscription_corrigé_à_instruire_de_nouveau
      { index: "young", type: "_doc" },
      queryFromFilter(user.role, user.region, user.department, [
        { terms: { "cohort.keyword": cohorts } },
        { terms: { "status.keyword": ["WAITING_VALIDATION"] } },
        { bool: { must: { exists: { field: "correctionRequests.keyword" } } } },
      ]),
      // Dossier (À relancer) X dossiers d’inscription en attente de correction
      // inscription_en_attente_de_correction
      { index: "young", type: "_doc" },
      queryFromFilter(user.role, user.region, user.department, [{ terms: { "cohort.keyword": cohorts } }, { terms: { "status.keyword": ["WAITING_CORRECTION"] } }]),
    ),
  });
  const results = response.body.responses;
  return {
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION]: results[0].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_CORRECTION]: results[1].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_CORRECTION]: results[2].hits.total.value,
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT] = async (user, { fiveDaysBeforeInscriptionEnd: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT]: [] };

  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson(
      { index: "young", type: "_doc" },
      withAggs(
        queryFromFilter(user.role, user.region, user.department, [{ terms: { "cohort.keyword": cohorts } }, { terms: { "status.keyword": ["WAITING_VALIDATION"] } }]),
        "cohort.keyword",
      ),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT] = async (user, { assignementOpen: cohorts }) => {
  if (!cohorts.length) return { [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT]: [] };
  let filters = [
    { terms: { "cohort.keyword": cohorts } },
    { terms: { "status.keyword": ["VALIDATED", "WAITING_LIST"] } },
    { bool: { should: [{ term: { imageRight: "N/A" } }, { bool: { must_not: { exists: { field: "imageRight" } } } }], minimum_should_match: 1 } },
  ];
  if (user.role === ROLES.HEAD_CENTER) {
    let contextFilters = await buildFilterContext(user, cohorts, "young");
    if (!contextFilters) return { [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT]: [] };
    filters.push(contextFilters);
  }

  const response = await esClient().msearch({
    index: "young",
    body: buildArbitratyNdJson({ index: "young", type: "_doc" }, withAggs(queryFromFilter(user.role, user.region, user.department, filters), "cohort.keyword")),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT]: response.body.responses[0].aggregations.cohort.buckets.map((e) => ({
      cohort: e.key,
      count: e.doc_count,
    })),
  };
};

module.exports = service;
