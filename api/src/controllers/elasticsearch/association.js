const passport = require("passport");
const express = require("express");
const router = express.Router();
const { canSearchAssociation } = require("snu-lib");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const { API_ASSOCIATION_ES_ENDPOINT } = require("../../config");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = [
      "identite_nom^10",
      "identite_sigle^5",
      "coordonnees_adresse_commune^4",
      "description^4",
      "coordonnees_adresse_region^3",
      "activites_objet^2",
      "activites_lib_famille1^2",
      "coordonnees_adresse_departement^1",
    ];
    const filterFields = ["coordonnees_adresse_region.keyword", "coordonnees_adresse_departement.keyword", "activites_lib_theme1.keyword"];
    const sortFields = [];

    const { user, body } = req;
    const size = body.size;

    const options = {
      node: `https://${API_ASSOCIATION_ES_ENDPOINT}`,
    };
    const es = new (require("@elastic/elasticsearch").Client)(options);

    if (!canSearchAssociation(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size });

    const should = ["url", "linkedin", "facebook", "twitter", "donation", "coordonnees_courriel", "coordonnees_telephone"].map((e) => ({
      exists: {
        field: e,
        boost: 2,
      },
    }));

    hitsRequestBody.query.bool.should = should;
    aggsRequestBody.query.bool.should = should;

    if (req.params.action === "export") {
      const response = await allRecords("association", hitsRequestBody.query, es);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await es.msearch({ index: "association", body: buildNdJson({ index: "association", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
