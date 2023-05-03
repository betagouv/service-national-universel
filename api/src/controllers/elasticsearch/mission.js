const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS, isYoung, isReferent } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name", "structureName", "city", "zip"];
    const filterFields = [
      "region.keyword",
      "department.keyword",
      "status.keyword",
      "isJvaMission.keyword",
      "visibility.keyword",
      "mainDomain.keyword",
      "placesLeft",
      "tutorName.keyword",
      "isMilitaryPreparation.keyword",
      "hebergement.keyword",
      "hebergementPayant.keyword",
      "placesStatus.keyword",
      "applicationStatus.keyword",
    ];
    const sortFields = ["createdAt", "placesLeft", "name.keyword"];

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];

    // A young can only see validated missions.
    if (isYoung(user)) contextFilters.push({ term: { "status.keyword": "VALIDATED" } });
    if (isReferent(user) && !canSearchInElasticSearch(user, "mission")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible cans only see their structure's missions.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      contextFilters.push({ terms: { "structureId.keyword": [user.structureId] } });
    }

    // A supervisor can only see their structures' missions.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    }

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    if (req.params.action === "export") {
      const response = await allRecords("mission", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
