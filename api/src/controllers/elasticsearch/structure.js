const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");

const corpsEnUniforme = ["SDIS (Service départemental d'Incendie et de Secours)", "Gendarmerie", "Police", "Armées"];

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["name", "city", "zip", "siret", "networkName"];
    const filterFields = ["department.keyword", "region.keyword", "legalStatus.keyword", "types.keyword", "sousType.keyword", "networkName.keyword", "isMilitaryPreparation.keyword", "structurePubliqueEtatType.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "structure")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
    });

    if (req.params.action === "export") {
      const structures = await allRecords("structure", hitsRequestBody.query);

      // --- fill team
      const structureIds = [...new Set(structures.map((item) => item._id).filter((e) => e))];
      if (structureIds.length > 0) {
        const referents = await allRecords("referent", {
          bool: {
            must: {
              match_all: {}
            },
            filter: [{ terms: { "structureId.keyword": structureIds } }]
          }
        });
        if (referents.length > 0) {
          for(let structure of structures) {
            structure.team = referents.filter((r) => r.structureId === structure._id);
          }
        }
      }

      return res.status(200).send({ ok: true, data: structures });
    } else {
      const response = await esClient.msearch({ index: "structure", body: buildNdJson({ index: "structure", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
