const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, canSearchSessionPhase1 } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const { ES_NO_LIMIT } = require("snu-lib");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["name", "city", "zip", "code2022", "typology", "domain"];
    const filterFields = ["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword", "typology.keyword", "domain.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    if (req.params.action === "export") {
      const response = await allRecords("cohesioncenter", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "cohesioncenter", body: buildNdJson({ index: "cohesioncenter", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/presence/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["name", "city", "zip", "code2022"];
    const filterFields = ["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword", "academy.keyword", "status"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (!canSearchSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    async function getAdditionalData(centerIds) {
      const responseSessions = await esClient.msearch({
        index: "sessionphase1",
        body: buildNdJson(
          { index: "sessionphase1", type: "_doc" },
          {
            body: {
              query: {
                bool: {
                  must: { match_all: {} },
                  filter: [{ terms: { "cohesionCenterId.keyword": centerIds } }, queryFilters.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null].filter(
                    Boolean,
                  ),
                },
              },
              size: ES_NO_LIMIT,
            },
          },
        ),
      });
      const sessionsPhase1 = responseSessions.length ? responses[0]?.hits?.hits?.map((e) => ({ ...e._source, _id: e._id })) : [];

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
        if (queryFilters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": selectedFilters.status?.filter } });
        if (selectedFilters.statusPhase1?.filter?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": selectedFilters.statusPhase1?.filter } });

        let sessionPhase1Id = sessionsPhase1.map((session) => session._id).filter((id) => id);
        if (sessionPhase1Id.length) body.query.bool.filter.push({ terms: { "sessionPhase1Id.keyword": sessionPhase1Id } });

        const { responses } = await api.esQuery("young", body);
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

        sessionByCenter = sessionsPhase1.reduce((acc, session) => {
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
      }

      const reducedSchool = responseYoungs.body.responses[0].aggregations.school.buckets.reduce((acc, school) => {
        if (school.key === "") return acc;
        const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
        const total = school.doc_count;
        const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.schoolDepartment) || {};
        const inDepartment = isThereDep.doc_count || 0;
        const outDepartment = total - inDepartment;
        if (!acc[school.key]) {
          acc[school.key] = {
            schoolId: school.key,
            total,
            inDepartment,
            outDepartment,
          };
        }
        return acc;
      }, {});
      return reducedSchool;
    }

    if (req.params.action === "export") {
      const response = await allRecords("cohesioncenter", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "cohesioncenter", body: buildNdJson({ index: "cohesioncenter", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
