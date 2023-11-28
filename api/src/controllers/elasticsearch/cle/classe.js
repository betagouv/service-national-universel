const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { allRecords } = require("../../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("../utils");
const EtablissementModel = require("../../../models/cle/etablissement");

async function buildClasseContext(user) {
  const contextFilters = [];

  if (user.role === ROLES.ADMINISTRATEUR_CLE) {
    const etablissement = await EtablissementModel.findOne({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] });
    if (!etablissement) return { classeContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ term: { "etablissementId.keyword": etablissement._id.toString() } });
  }

  if (user.role === ROLES.REFERENT_CLASSE) {
    contextFilters.push({ term: { "referentClasseIds.keyword": user._id.toString() } });
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    const etablissements = await EtablissementModel.find({ department: user.department });
    contextFilters.push({ terms: { "etablissementId.keyword": etablissements.map((e) => e._id.toString()) } });
  }
  if (user.role === ROLES.REFERENT_REGION) {
    const etablissements = await EtablissementModel.find({ department: user.region });
    contextFilters.push({ terms: { "etablissementId.keyword": etablissements.map((e) => e._id.toString()) } });
  }

  return { classeContextFilters: contextFilters };
}

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["cohort.keyword", "name.keyword", "uniqueKeyAndId.keyword"];
    const filterFields = [
      "cohort.keyword",
      "coloration.keyword",
      "grade.keyword",
      "name.keyword",
      "sector.keyword",
      "status.keyword",
      "statusPhase1.keyword",
      "type.keyword",
      "uniqueKeyAndId.keyword",
    ];

    const sortFields = ["createdAt", "name.keyword"];

    // Authorization
    if (!canSearchInElasticSearch(user, "classe")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { classeContextFilters, classeContextError } = await buildClasseContext(user);
    if (classeContextError) {
      return res.status(classeContextError.status).send(classeContextError.body);
    }

    // Context filters
    const contextFilters = [...classeContextFilters, { bool: { must_not: { exists: { field: "deletedAt" } } } }];

    // Body params validation
    const { queryFilters, page, sort, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body: body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });
    if (req.params.action === "export") {
      const response = await allRecords("classe", hitsRequestBody.query, esClient, exportFields);
      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient.msearch({ index: "classe", body: buildNdJson({ index: "classe", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
