const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");
const { YOUNG_STATUS_PHASE1, ES_NO_LIMIT } = require("snu-lib");

// Disclaimer: not used, this route is for demo purpose only (still, it handles the context filters for youngs).
router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

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
      if (!sessionPhase1.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      contextFilters.push(
        { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
        { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
      );
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(404).send({ ok: true, data: "no cohort available" });
      }
    }
    // A responsible can only see youngs in application of their structure.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const applications = await ApplicationObject.find({ structureId: user.structureId });
      contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    // A supervisor can only see youngs in application of their structures.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structures = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      const applications = await ApplicationObject.find({ structureId: { $in: structures.map((e) => e._id.toString()) } });
      contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    if (user.role === ROLES.REFERENT_REGION) {
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

    // Visitors can only get aggregations and is limited to its region.
    if (user.role === ROLES.VISITOR) {
      contextFilters.push({ term: { "region.keyword": user.region } });
      body.size = 0;
    }

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields: ["lastName", "firstName", "email", "city"],
      filterFields: ["department.keyword", "region.keyword", "cohort.keyword", "grade.keyword"],
      queryFilters: body.filters,
      page: body.page,
      sort: body.sort,
      contextFilters,
    });
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
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

    const filterFields = ["statusPhase1", "region", "department", "cohort", "academy", "status"];
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

module.exports = router;
