const passport = require("passport");
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { canSearchAssociation } = require("snu-lib");
const { capture } = require("../../Services/sentry");
const { ERRORS } = require("../../../Application/Utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const { API_ENGAGEMENT_URL, API_ENGAGEMENT_KEY } = require("../../Config/config");

const apiEngagement = async ({ path = "/", body }) => {
  try {
    const myHeaders = new fetch.Headers();
    myHeaders.append("X-API-KEY", API_ENGAGEMENT_KEY);
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(body),
    };
    const res = await fetch(`${API_ENGAGEMENT_URL}${path}`, requestOptions);
    return await res.json();
  } catch (e) {
    capture(e, { extra: { path: path } });
  }
};

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

    if (!canSearchAssociation(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
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

    const response = await apiEngagement({ path: `/v0/association/snu`, body: req.body });
    return res.status(200).send(response);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
