const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildArbitratyNdJson } = require("./utils");

router.post("/default", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    function queryFromFilter(filter) {
      return {
        size: 0,
        track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
        query: { bool: { must: { match_all: {} }, filter } },
      };
    }

    const response = await esClient.msearch({
      index: "young",
      body: buildArbitratyNdJson(
        { index: "young", type: "_doc" },
        queryFromFilter([{ terms: { "status.keyword": ["WAITING_VALIDATION"] } }, { bool: { must_not: { exists: { field: "correctionRequests.keyword" } } } }]),
        { index: "young", type: "_doc" },
        queryFromFilter([{ terms: { "status.keyword": ["WAITING_VALIDATION"] } }, { bool: { must: { exists: { field: "correctionRequests.keyword" } } } }]),
      ),
    });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
