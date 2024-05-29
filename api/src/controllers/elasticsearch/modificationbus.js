const passport = require("passport");
const express = require("express");
const router = express.Router();
const { canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields = ["lineName", "requestUserName", "requestMessage"];
    const filterFields = ["lineName.keyword", "tagIds.keyword", "status.keyword", "opinion.keyword", "requestUserRole.keyword", "cohort.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "modificationbus")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size });

    if (req.params.action === "export") {
      const response = await allRecords("modificationbus", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient().msearch({ index: "modificationbus", body: buildNdJson({ index: "modificationbus", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
