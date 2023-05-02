const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildNdJson, joiElasticSearch } = require("./utils");
const { ES_NO_LIMIT } = require("snu-lib");

router.post("/by-point-de-rassemblement", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { queryFilters, error } = joiElasticSearch({ filterFields: ["meetingPointIds", "cohort"], body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: { bool: { filter: [{ terms: { "meetingPointsIds.keyword": queryFilters.meetingPointIds } }, { terms: { "cohort.keyword": queryFilters.cohort } }] } },
      aggs: {
        group_by_meetingPointId: {
          terms: { field: "meetingPointsIds.keyword", size: ES_NO_LIMIT },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    const response = await esClient.msearch({ index: "lignebus", body: buildNdJson({ index: "lignebus", type: "_doc" }, body) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
