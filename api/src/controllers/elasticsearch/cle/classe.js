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
const { serializeReferents } = require("../../../utils/es-serializer");

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
    const etablissements = await EtablissementModel.find({ region: user.region });
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
      "etablissementId.keyword",
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

    const populateWithReferentInfo = async (classe) => {
      const refIds = [...new Set(classe.map((item) => item._source.referentClasseIds).filter(Boolean))];
      const referents = await allRecords("referent", {
        ids: {
          values: refIds.flat(),
        },
      });
      const referentsData = serializeReferents(referents);
      classe = classe.map((item) => {
        item._source.referentClasse = referentsData?.filter((e) => item._source.referentClasseIds.includes(e._id.toString()));
        return item;
      });
      return classe;
    };

    if (req.params.action === "export") {
      const response = await allRecords("classe", hitsRequestBody.query, esClient, exportFields);
      return res.status(200).send({ ok: true, data: response });
    } else {
      let response = await esClient.msearch({ index: "classe", body: buildNdJson({ index: "classe", type: "_doc" }, hitsRequestBody, aggsRequestBody) });

      if (req.query?.needRefInfo) {
        response.body.responses[0].hits.hits = await populateWithReferentInfo(response.body.responses[0].hits.hits);
      }

      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
