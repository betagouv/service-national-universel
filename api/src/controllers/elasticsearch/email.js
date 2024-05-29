const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, canViewEmailHistory } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

router.post("/:email/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["subject"];
    const filterFields = ["templateId.keyword", "event.keyword"];
    const sortFields = [];

    const { user, body, params } = req;

    if (!canViewEmailHistory(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [user.role !== ROLES.ADMIN ? { term: { "event.keyword": "delivered" } } : null, { term: { "email.keyword": params.email } }].filter(Boolean);

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    //add collapse to hitsRequestBody and aggsRequestBody
    hitsRequestBody.collapse = { field: "messageId.keyword" };
    aggsRequestBody.collapse = { field: "messageId.keyword" };

    if (req.params.action === "export") {
      const response = await allRecords("email", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient().msearch({ index: "email", body: buildNdJson({ index: "email", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
