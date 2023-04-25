const passport = require("passport");
const express = require("express");
const router = express.Router();
const { canSearchLigneBus } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
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
    ];
    const sortFields = [];

    // Authorization
    if (!canSearchLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [{ bool: { must_not: { exists: { field: "deletedAt" } } } }];

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
