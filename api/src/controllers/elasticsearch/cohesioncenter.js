/* eslint-disable no-inner-declarations */
const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, ES_NO_LIMIT, canSearchInElasticSearch, canSearchSessionPhase1 } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;

    const searchFields = ["name", "city", "zip", "code2022", "typology", "domain"];
    const filterFields = ["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword", "typology.keyword", "domain.keyword"];
    const sortFields = [];
    // Authorization
    if (!canSearchInElasticSearch(req.user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size });

    let response;
    let cohesionCenters = [];
    if (req.params.action === "export") {
      response = await allRecords("cohesioncenter", hitsRequestBody.query);
      cohesionCenters = response.map((s) => ({ _id: s._id, _source: s }));
    } else {
      const esReponse = await esClient().msearch({ index: "cohesioncenter", body: buildNdJson({ index: "cohesioncenter", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      response = esReponse.body;
      cohesionCenters = response?.responses[0]?.hits?.hits || [];
    }

    if (req.query.needSessionPhase1Info) {
      cohesionCenters = await populateWithSessionPhase1Info(cohesionCenters);
      if (req.params.action === "export") response = cohesionCenters.map((s) => s._source);
      else response.responses[0].hits.hits = cohesionCenters;
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

router.post("/not-in-cohort/:cohort", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["name", "city", "zip", "code2022", "typology", "domain", "centerDesignation"];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields: [], body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody } = buildRequestBody({ searchFields, filterFields: [], queryFilters, page, sort, contextFilters });
    hitsRequestBody.size = ES_NO_LIMIT;
    hitsRequestBody.query.bool.must_not = [{ term: { "cohorts.keyword": String(req.params.cohort) } }];

    const response = await esClient().msearch({ index: "cohesioncenter", body: buildNdJson({ index: "cohesioncenter", type: "_doc" }, hitsRequestBody) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/presence/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["name", "city", "zip", "code2022"];
    const filterFields = ["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword", "academy.keyword", "status.keyword", "statusPhase1.keyword"];
    const filterFieldsCenter = ["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword", "academy.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (!canSearchSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const queryFiltersCenter = { ...queryFilters };
    delete queryFiltersCenter.status;
    delete queryFiltersCenter.statusPhase1;

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields: filterFieldsCenter,
      queryFilters: queryFiltersCenter,
      page,
      sort,
      contextFilters,
      size,
    });

    async function getAdditionalData(centerIds) {
      const sessionQuery = {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { "cohesionCenterId.keyword": centerIds } }, queryFilters.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohorts } } : null].filter(
            Boolean,
          ),
        },
      };
      const {
        body: { responses },
      } = await esClient().msearch({
        index: "sessionphase1",
        body: buildNdJson({ index: "sessionphase1", type: "_doc" }, { query: sessionQuery, size: ES_NO_LIMIT }),
      });
      const sessionsPhase1 = responses.length ? responses[0]?.hits?.hits?.map((e) => ({ ...e._source, _id: e._id })) : [];
      if (sessionsPhase1?.length) {
        const body = {
          query: { bool: { must: { match_all: {} }, filter: [] } },
          aggs: {
            session: {
              terms: { field: "sessionPhase1Id.keyword", size: ES_NO_LIMIT },
              aggs: {
                presence: { terms: { field: "cohesionStayPresence.keyword", missing: "NR" } },
                presenceJDM: { terms: { field: "presenceJDM.keyword", missing: "NR" } },
                depart: { terms: { field: "departInform.keyword", missing: "NR" } },
                sanitaryField: { terms: { field: "cohesionStayMedicalFileReceived.keyword", missing: "NR" } },
              },
            },
          },
          size: 0,
        };
        if (queryFilters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": queryFilters.status } });
        if (queryFilters.statusPhase1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": queryFilters.statusPhase1 } });

        let sessionPhase1Id = sessionsPhase1.map((session) => session._id).filter((id) => id);
        if (sessionPhase1Id.length) body.query.bool.filter.push({ terms: { "sessionPhase1Id.keyword": sessionPhase1Id } });

        const {
          body: { responses },
        } = await esClient().msearch({
          index: "young",
          body: buildNdJson({ index: "young", type: "_doc" }, body),
        });

        if (!responses?.length) return;
        const sessionAggreg = responses[0].aggregations.session.buckets.reduce((acc, session) => {
          acc[session.key] = {
            total: session.doc_count,
            presence: session.presence.buckets.reduce((acc, presence) => {
              acc[presence.key] = presence.doc_count;
              return acc;
            }, {}),
            presenceJDM: session.presenceJDM.buckets.reduce((acc, presenceJDM) => {
              acc[presenceJDM.key] = presenceJDM.doc_count;
              return acc;
            }, {}),
            depart: session.depart.buckets.reduce((acc, depart) => {
              acc[depart.key] = depart.doc_count;
              return acc;
            }, {}),
            sanitaryField: session.sanitaryField.buckets.reduce((acc, sanitaryField) => {
              acc[sanitaryField.key] = sanitaryField.doc_count;
              return acc;
            }, {}),
          };
          return acc;
        }, {});

        const sessionByCenter = sessionsPhase1.reduce((acc, session) => {
          if (!acc[session.cohesionCenterId]) {
            acc[session.cohesionCenterId] = {
              centerId: session.cohesionCenterId,
              total: sessionAggreg[session._id]?.total || 0,
              presenceOui: sessionAggreg[session._id]?.presence?.true || 0,
              presenceNon: sessionAggreg[session._id]?.presence?.false || 0,
              presenceNR: sessionAggreg[session._id]?.presence?.NR || 0,
              presenceJDMOui: sessionAggreg[session._id]?.presenceJDM?.true || 0,
              presenceJDMNon: sessionAggreg[session._id]?.presenceJDM?.false || 0,
              presenceJDMNR: sessionAggreg[session._id]?.presenceJDM?.NR || 0,
              departOui: sessionAggreg[session._id]?.depart?.true || 0,
              sanitaryFieldOui: sessionAggreg[session._id]?.sanitaryField?.true || 0,
              sanitaryFieldNon: sessionAggreg[session._id]?.sanitaryField?.false || 0,
              sanitaryFieldNR: sessionAggreg[session._id]?.sanitaryField?.NR || 0,
            };
          } else {
            acc[session.cohesionCenterId].total += sessionAggreg[session._id]?.total || 0;
            acc[session.cohesionCenterId].presenceOui += sessionAggreg[session._id]?.presence?.true || 0;
            acc[session.cohesionCenterId].presenceNon += sessionAggreg[session._id]?.presence?.false || 0;
            acc[session.cohesionCenterId].presenceNR += sessionAggreg[session._id]?.presence?.NR || 0;
            acc[session.cohesionCenterId].presenceJDMOui += sessionAggreg[session._id]?.presenceJDM?.true || 0;
            acc[session.cohesionCenterId].presenceJDMNon += sessionAggreg[session._id]?.presenceJDM?.false || 0;
            acc[session.cohesionCenterId].presenceJDMNR += sessionAggreg[session._id]?.presenceJDM?.NR || 0;
            acc[session.cohesionCenterId].departOui += sessionAggreg[session._id]?.depart?.true || 0;
            acc[session.cohesionCenterId].sanitaryFieldOui += sessionAggreg[session._id]?.sanitaryField?.true || 0;
            acc[session.cohesionCenterId].sanitaryFieldNon += sessionAggreg[session._id]?.sanitaryField?.false || 0;
            acc[session.cohesionCenterId].sanitaryFieldNR += sessionAggreg[session._id]?.sanitaryField?.NR || 0;
          }
          return acc;
        }, {});
        return sessionByCenter;
      }
      return {};
    }

    if (req.params.action === "export") {
      let response = await allRecords("cohesioncenter", hitsRequestBody.query);
      const reducedAdditionalData = await getAdditionalData(response.map((h) => h._id));
      response = response.map((h) => {
        const additionalData = reducedAdditionalData[h._id];
        if (!additionalData) return h;
        return { ...h, ...additionalData };
      });
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient().msearch({ index: "cohesioncenter", body: buildNdJson({ index: "cohesioncenter", type: "_doc" }, hitsRequestBody, aggsRequestBody) });

      const reducedAdditionalData = await getAdditionalData(response.body.responses[0].hits.hits.map((h) => h._id));
      response.body.responses[0].hits.hits = response.body.responses[0].hits.hits.map((h) => {
        const additionalData = reducedAdditionalData[h._id];
        if (!additionalData) return h;
        return { ...h, _source: { ...h._source, ...additionalData } };
      });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const populateWithSessionPhase1Info = async (cohesionCenters) => {
  const cohesionCentersIds = cohesionCenters.map((s) => s._id);
  const sessionPhase1s = await allRecords("sessionphase1", { terms: { "cohesionCenterId.keyword": cohesionCentersIds } });
  cohesionCenters = cohesionCenters.map((center) => ({
    ...center,
    _source: { ...center._source, sessionsPhase1: sessionPhase1s.filter((sp) => sp.cohesionCenterId.toString() === center._id.toString()) },
  }));

  return cohesionCenters;
};

module.exports = router;
