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

module.exports = router;
