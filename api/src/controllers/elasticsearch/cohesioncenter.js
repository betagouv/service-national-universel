const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

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

module.exports = router;
