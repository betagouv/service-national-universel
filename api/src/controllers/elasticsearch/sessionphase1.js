const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, ES_NO_LIMIT } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields = ["nameCentre", "cityCentre", "zipCentre", "codeCentre"];
    const filterFields = [
      "department.keyword",
      "region.keyword",
      "cohort.keyword",
      "code.keyword",
      "placesLeft",
      "hasTimeSchedule.keyword",
      "typology.keyword",
      "domain.keyword",
      "hasPedagoProject.keyword",
      "headCenterExist",
    ];
    // check query parameters to fill cohesionCenter

    const sortFields = [];
    // Authorization
    if (!canSearchInElasticSearch(req.user, "sessionphase1")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, exportFields, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
      customQueries: {
        headCenterExist: (query, value) => {
          const conditions = [];
          if (value.includes("true")) conditions.push({ bool: { must: [{ exists: { field: "headCenterId.keyword" } }] } });
          if (value.includes("false")) conditions.push({ bool: { must_not: [{ exists: { field: "headCenterId.keyword" } }] } });
          if (conditions.length) query.bool.must.push({ bool: { should: conditions } });
          return query;
        },
        headCenterExistAggs: () => {
          return {
            terms: { field: "headCenterId.keyword", size: ES_NO_LIMIT, missing: "N/A" },
          };
        },
      },
    });

    let sessionphase1 = [];
    let response;
    if (req.params.action === "export") {
      response = await allRecords("sessionphase1", hitsRequestBody.query, esClient(), exportFields);
      sessionphase1 = response.map((s) => ({ _id: s._id, _source: s }));
    } else {
      const esReponse = await esClient().msearch({ index: "sessionphase1", body: buildNdJson({ index: "sessionphase1", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      response = esReponse.body;
      sessionphase1 = response?.responses[0]?.hits?.hits || [];
    }

    if (req.query.needCohesionCenterInfo) {
      sessionphase1 = await populateWithCohesionCenter(sessionphase1);
      if (req.params.action === "export") response = sessionphase1;
      else response.responses[0].hits.hits = sessionphase1;
    }
    if (req.query.needHeadCenterInfo) {
      sessionphase1 = await populateWithHeadCenter(sessionphase1);
      if (req.params.action === "export") response = sessionphase1;
      else response.responses[0].hits.hits = sessionphase1;
    }

    if (req.params.action === "export") {
      return res.status(200).send({ ok: true, data: response });
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/young-affectation/:cohort/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["nameCentre", "cityCentre", "zipCentre", "codeCentre", "department", "region"];
    const filterFields = [];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "sessionphase1")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let contextFilters = [{ term: { "cohort.keyword": req.params.cohort } }, { range: { placesLeft: { gt: 0 } } }];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size: 3 });

    if (req.params.action === "export") {
      const response = await allRecords("sessionphase1", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient().msearch({ index: "sessionphase1", body: buildNdJson({ index: "sessionphase1", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const populateWithCohesionCenter = async (sessionphase1) => {
  const cohesionCenterIds = [...new Set(sessionphase1.map((item) => item._source.cohesionCenterId).filter((e) => e))];
  if (cohesionCenterIds.length > 0) {
    // --- fill cohesionCenter
    const cohesionCenters = await allRecords("cohesioncenter", { ids: { values: cohesionCenterIds } });
    sessionphase1 = sessionphase1.map((item) => ({
      ...item,
      _source: { ...item._source, cohesionCenter: cohesionCenters.find((e) => e._id === item._source.cohesionCenterId) },
    }));
  }
  return sessionphase1;
};

const populateWithHeadCenter = async (sessionphase1) => {
  const headCenterIds = [...new Set(sessionphase1.map((item) => item._source.headCenterId).filter((e) => e))];
  if (headCenterIds.length > 0) {
    // --- fill headCenter
    const headCenters = await allRecords("referent", { ids: { values: headCenterIds } });
    sessionphase1 = sessionphase1.map((item) => ({ ...item, _source: { ...item._source, headCenter: headCenters.find((e) => e._id === item._source.headCenterId) } }));
  }
  return sessionphase1;
};

module.exports = router;
