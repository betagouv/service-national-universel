const passport = require("passport");
const express = require("express");
const router = express.Router();
const { canSearchLigneBus } = require("snu-lib");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");
const { ROLES } = require("snu-lib");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const SessionPhase1Object = require("../../models/sessionPhase1");

const getContextFilters = async (user, queryFilters) => {
  let contextFilters = [{ bool: { must_not: { exists: { field: "deletedAt" } } } }];

  if (user.role === ROLES.REFERENT_REGION) {
    const centers = await SessionPhase1Object.find({ region: user.region, cohort: queryFilters.cohort[0] });
    if (!centers.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const lignebus = await LigneBusModel.find({ centerId: { $in: centers.map((center) => center.cohesionCenterId) }, cohort: queryFilters.cohort[0] });
    if (!lignebus.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { _id: lignebus.map((e) => e._id) } });
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    const departments = user.department;
    const centers = await SessionPhase1Object.find({ department: { $in: departments }, cohort: queryFilters.cohort[0] });
    if (!centers.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const lignebus = await LigneBusModel.find({ centerId: { $in: centers.map((center) => center.cohesionCenterId) }, cohort: queryFilters.cohort[0] });
    if (!lignebus.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { _id: lignebus.map((e) => e._id) } });
  }

  if (user.role === ROLES.HEAD_CENTER) {
    const centers = await SessionPhase1Object.find({ headCenterId: user._id, cohort: queryFilters.cohort[0] });
    if (!centers.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const lignebus = await LigneBusModel.find({ centerId: centers[0].cohesionCenterId, cohort: queryFilters.cohort[0] });
    if (!lignebus.length) return { error: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { _id: lignebus.map((e) => e._id) } });
  }

  return { contextFilters };
};

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields = ["busId", "pointDeRassemblements.region", "pointDeRassemblements.city", "centerCode", "centerCity", "centerRegion"];
    const filterFields = [
      "busId.keyword",
      "cohort.keyword",
      "departureString.keyword",
      "returnString.keyword",
      "pointDeRassemblements.name.keyword",
      "pointDeRassemblements.region.keyword",
      "pointDeRassemblements.department.keyword",
      "pointDeRassemblements.city.keyword",
      "pointDeRassemblements.code.keyword",
      "centerName.keyword",
      "centerRegion.keyword",
      "centerDepartment.keyword",
      "centerCode.keyword",
      "modificationBuses.requestMessage.keyword",
      "modificationBuses.status.keyword",
      "modificationBuses.opinion.keyword",
      "lineFillingRate",
      "delayedForth.keyword",
      "delayedBack.keyword",
    ];
    const sortFields = [];

    // Authorization
    if (!canSearchLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    const { contextFilters, error: contextError } = await getContextFilters(user, queryFilters);
    if (contextError) return res.status(contextError.status).send(contextError.body);

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      customQueries: {
        lineFillingRate: (query, value) => {
          const conditions = [];
          for (const v of value) {
            if (v === "Vide") conditions.push({ term: { lineFillingRate: 0 } });
            if (v === "Rempli") conditions.push({ range: { lineFillingRate: 100 } });
            else {
              const range = v.split("-").map((x) => parseInt(x.replace("%", ""), 10));
              conditions.push({ range: { lineFillingRate: { gte: range[0], lte: range[1] } } });
            }
          }
          if (conditions.length) query.bool.must.push({ bool: { should: conditions } });
          return query;
        },
      },
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      const response = await allRecords("plandetransport", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "plandetransport", body: buildNdJson({ index: "plandetransport", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
