const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { joiElasticSearch } = require("../utils");
const { ES_NO_LIMIT, COHORTS } = require("snu-lib");

router.post("/example", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const body = {
      query: { bool: { must: { match_all: {} } } },
      size: ES_NO_LIMIT,
    };
    const responseInscription = await esClient.search({ index: "inscriptiongoal", body: body });
    if (!responseInscription?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    return res.status(200).send(responseInscription.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/structures", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const filterFields = ["region", "departement"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        total_with_network_name: {
          filter: {
            bool: {
              must_not: [{ term: { "networkName.keyword": "" } }, { bool: { must_not: { exists: { field: "networkName" } } } }],
            },
          },
        },
        by_legal_status: {
          terms: {
            field: "legalStatus.keyword",
            missing: "EMPTY",
          },
          aggs: {
            by_type: {
              terms: {
                field: "types.keyword",
              },
            },
          },
        },
      },
      size: 0,
      track_total_hits: true,
    };
    const responseInscription = await esClient.search({ index: "structure", body: body });
    if (!responseInscription?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    return res.status(200).send(responseInscription.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
