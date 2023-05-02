const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const datesub = require("date-fns/sub");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");
const { YOUNG_STATUS_PHASE1, ES_NO_LIMIT } = require("snu-lib");
const { serializeYoungs } = require("../../utils/es-serializer");
const StructureObject = require("../../models/structure");
const ApplicationObject = require("../../models/application");
const SessionPhase1Object = require("../../models/sessionPhase1");
const { getCohortNamesEndAfter } = require("../../utils/cohort");

async function buildYoungContext(user, showAffectedToRegionOrDep = false) {
  const contextFilters = [];

  if (user.role !== ROLES.ADMIN)
    contextFilters.push({
      terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST", "ABANDONED", "REINSCRIPTION"] },
    });

  // Open in progress inscription to referent
  if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) contextFilters[0].terms["status.keyword"].push("IN_PROGRESS");

  // A head center can only see youngs of their session.
  if (user.role === ROLES.HEAD_CENTER) {
    const sessionPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
    if (!sessionPhase1.length) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push(
      { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
      { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
    );
    const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
    if (visibleCohorts.length > 0) {
      contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
    } else {
      // Tried that to specify when there's just no data or when the head center has no longer access
      return { youngContextError: { status: 404, body: { ok: true, code: "no cohort available" } } };
    }
  }
  // A responsible can only see youngs in application of their structure.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const applications = await ApplicationObject.find({ structureId: user.structureId });
    contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
  }

  // A supervisor can only see youngs in application of their structures.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structures = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    const applications = await ApplicationObject.find({ structureId: { $in: structures.map((e) => e._id.toString()) } });
    contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
  }

  if (user.role === ROLES.REFERENT_REGION && !showAffectedToRegionOrDep) {
    contextFilters.push({ term: { "region.keyword": user.region } });
  }

  if (user.role === ROLES.REFERENT_REGION && showAffectedToRegionOrDep) {
    const sessionPhase1 = await SessionPhase1Object.find({ region: user.region });
    if (sessionPhase1.length === 0) {
      contextFilters.push({ term: { "region.keyword": user.region } });
    } else {
      contextFilters.push({
        bool: {
          should: [{ terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } }, { term: { "region.keyword": user.region } }],
        },
      });
    }
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT && !showAffectedToRegionOrDep) {
    contextFilters.push({ terms: { "department.keyword": user.department } });
  }
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    const sessionPhase1 = await SessionPhase1Object.find({ department: { $in: user.department } });
    if (sessionPhase1.length === 0) {
      contextFilters.push({ terms: { "department.keyword": user.department } });
    } else {
      contextFilters.push({
        bool: {
          should: [
            { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
            { terms: { "department.keyword": user.department } },
          ],
        },
      });
    }
  }

  // Visitors are limited to their region.
  if (user.role === ROLES.VISITOR) {
    contextFilters.push({ term: { "region.keyword": user.region } });
  }
  return { youngContextFilters: contextFilters };
}

router.post("/in-bus/:ligneId/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["email", "firstName", "lastName", "city", "zip"];
    const filterFields = ["meetingPointId.keyword", "meetingPointName.keyword", "meetingPointCity.keyword", "region.keyword", "department.keyword"];
    const sortFields = [];

    const { youngContextFilters, youngContextError } = await buildYoungContext(req.user, true);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...youngContextFilters,
      { terms: { "ligneId.keyword": [String(req.params.ligneId)] } },
      { terms: { "status.keyword": ["VALIDATED"] } },
      { bool: { must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }] } },
    ];

    // Body params validation
    const { queryFilters, page, exportFields, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort: { field: "lastName.keyword", order: "asc" },
      contextFilters,
      customQueries: {
        meetingPointName: (query, value) => {
          query.bool.must.push({ terms: { "meetingPointId.keyword": value } });
          return query;
        },
        meetingPointCity: (query, value) => {
          query.bool.must.push({ terms: { "meetingPointId.keyword": value } });
          return query;
        },
        meetingPointNameAggs: () => {
          return { terms: { field: "meetingPointId.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
        meetingPointCityAggs: () => {
          return { terms: { field: "meetingPointId.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
      },
    });
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query, esClient, exportFields);
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient.msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/moderator/sejour/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["statusPhase1", "region", "department", "cohorts", "academy", "status"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const aggsFilter = {};
    if (queryFilters?.statusPhase1?.length) {
      aggsFilter.filter = {
        bool: {
          must: [],
          filter: [{ terms: { "statusPhase1.keyword": queryFilters?.statusPhase1?.filter((s) => s !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) } }],
        },
      };
    }

    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        statusPhase1: { terms: { field: "statusPhase1.keyword" } },
        pdr: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "hasMeetingInformation.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        participation: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "youngPhase1Agreement.keyword", size: ES_NO_LIMIT } } },
        },
        precense: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "cohesionStayPresence.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        JDM: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "presenceJDM.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        depart: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "departInform.keyword", size: ES_NO_LIMIT } } },
        },
        departMotif: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "departSejourMotif.keyword", size: ES_NO_LIMIT } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    if (queryFilters.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": queryFilters.region } });
    if (queryFilters.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": queryFilters.department } });
    if (queryFilters.cohorts?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": queryFilters.cohorts } });
    if (queryFilters.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": queryFilters.academy } });
    if (queryFilters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": queryFilters.status } });

    const response = await esClient.msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, body) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-school/:view(inscriptions|volontaires)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSearchInElasticSearch(req.user, "young-by-school")) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const filterFields = ["schoolIds", "cohort", "academy"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { terms: { "schoolId.keyword": queryFilters.schoolIds } },
            req.user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": req.user.department } } : null,
            req.user.role === ROLES.REFERENT_REGION ? { terms: { "region.keyword": req.user.region } } : null,
            req.params.view === "volontaires"
              ? { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }
              : null,
            queryFilters.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        school: {
          terms: { field: "schoolId.keyword", size: ES_NO_LIMIT },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };


    const response = await esClient.msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, body) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
