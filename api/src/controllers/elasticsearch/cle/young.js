const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, YOUNG_SOURCE } = require("snu-lib");
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { allRecords } = require("../../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("../utils");
const { EtablissementModel, ClasseModel } = require("../../../models");
const { populateYoungExport, populateYoungWithClasse } = require("../populate/populateYoung");
const { serializeYoungs } = require("../../../utils/es-serializer");

async function buildYoungCleContext(user) {
  const contextFilters = [];

  if (user.role === ROLES.ADMINISTRATEUR_CLE) {
    const etablissement = await EtablissementModel.findOne({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] });
    if (!etablissement) return { youngCleContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ term: { "etablissementId.keyword": etablissement._id.toString() } });
  }

  if (user.role === ROLES.REFERENT_CLASSE) {
    const classes = await ClasseModel.find({ referentClasseIds: user._id });
    contextFilters.push({ terms: { "classeId.keyword": classes.map((c) => c._id.toString()) } });
  }

  return { youngCleContextFilters: contextFilters };
}

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip", "parent1Email.keyword", "parent2Email.keyword"];
    const filterFields = [
      "CNIFileNotValidOnStart.keyword",
      "allergies.keyword",
      "cohesionStayMedicalFileReceived.keyword",
      "cohesionStayPresence.keyword",
      "cohort.keyword",
      "country.keyword",
      "departInform.keyword",
      "departSejourMotif.keyword",
      "department.keyword",
      "gender.keyword",
      "grade.keyword",
      "handicap.keyword",
      "hasMeetingInformation.keyword",
      "imageRight.keyword",
      "isRegionRural.keyword",
      "ligneId.keyword",
      "paiBeneficiary.keyword",
      "ppsBeneficiary.keyword",
      "presenceJDM.keyword",
      "qpv.keyword",
      "reducedMobilityAccess.keyword",
      "region.keyword",
      "sessionPhase1Id.keyword",
      "situation.keyword",
      "specificAmenagment.keyword",
      "status.keyword",
      "statusPhase1.keyword",
      "youngPhase1Agreement.keyword",
      "classeId.keyword",
      "etablissementId.keyword",
      "inscriptionStep2023.keyword",
    ];

    const sortFields = ["lastName.keyword", "firstName.keyword", "createdAt", "classeId.keyword"];

    // Authorization
    if (!canSearchInElasticSearch(user, "youngCle")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { youngCleContextFilters, youngCleContextError } = await buildYoungCleContext(user);
    if (youngCleContextError) {
      return res.status(youngCleContextError.status).send(youngCleContextError.body);
    }

    // Context filters
    const contextFilters = [...youngCleContextFilters, { term: { "source.keyword": YOUNG_SOURCE.CLE } }];
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
      const response = await allRecords("young", hitsRequestBody.query, esClient, exportFields);
      let data = serializeYoungs(response);
      data = await populateYoungExport(data, exportFields);
      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient.msearch({
        index: "young",
        body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody),
      });

      if (req.query.needClasseInfo) {
        // Extraire les résultats
        let youngs = response.body.responses[0].hits.hits || [];

        // Enrichir les résultats
        youngs = await populateYoungWithClasse(youngs);

        // Mettre à jour et envoyer la réponse
        response.body.responses[0].hits.hits = youngs;
      }
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
