const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { allRecords } = require("../../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("../utils");
const { populateWithReferentInfo, populateEtablissementWithNumber } = require("../populate/populateEtablissement");

async function buildEtablisssementContext(user) {
  const contextFilters = [];

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    contextFilters.push({ terms: { "department.keyword": user.department } });
  }
  if (user.role === ROLES.REFERENT_REGION) {
    contextFilters.push({ terms: { "region.keyword": [user.region] } });
  }

  return { etablissementContextFilters: contextFilters };
}

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name.keyword", "zip.keyword", "address.keyword"];
    const filterFields = [
      "uai.keyword",
      "name.keyword",
      "department.keyword",
      "region.keyword",
      "city.keyword",
      "type.keyword",
      "sector.keyword",
      "state.keyword",
      "academy.keyword",
      "schoolYears.keyword",
    ];

    const sortFields = ["createdAt", "name.keyword"];

    // Authorization
    if (!canSearchInElasticSearch(user, "etablissement")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { etablissementContextFilters, etablissementContextError } = await buildEtablisssementContext(user);
    if (etablissementContextError) {
      return res.status(etablissementContextError.status).send(etablissementContextError.body);
    }

    // Context filters
    const contextFilters = [...etablissementContextFilters, { bool: { must_not: { exists: { field: "deletedAt" } } } }];

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
      let etablissements = await allRecords("etablissement", hitsRequestBody.query, esClient, exportFields);
      if (req.query.needReferentInfo) {
        etablissements = await populateWithReferentInfo({ etablissements, isExport: true });
      }
      etablissements = await populateEtablissementWithNumber({ etablissements, index: "classe" });
      etablissements = await populateEtablissementWithNumber({ etablissements, index: "young" });
      return res.status(200).send({ ok: true, data: etablissements });
    } else {
      const esResponse = await esClient.msearch({ index: "etablissement", body: buildNdJson({ index: "etablissement", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      let body = esResponse.body;
      let etablissements = body.responses[0].hits.hits || [];
      etablissements = await populateEtablissementWithNumber({ etablissements, index: "classe" });
      etablissements = await populateEtablissementWithNumber({ etablissements, index: "young" });

      body.responses[0].hits.hits = etablissements;
      return res.status(200).send(body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
