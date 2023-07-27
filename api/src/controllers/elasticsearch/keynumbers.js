const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildNdJson, joiElasticSearch, buildRequestBody } = require("./utils");
const { ES_NO_LIMIT, canSearchLigneBus, canSearchInElasticSearch, ROLES } = require("snu-lib");
const { allRecords } = require("../../es/utils");

router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const user = req.user;
    if (!canSearchInElasticSearch(user, "modificationbus")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const { notesFromDate: startDate, notesToDate: endDate, notesPhase } = req.body;

    let notes = [];

    if (notesPhase.includes("sejour")) {
      // Demandes de modification du plan de transport
      let body = {
        query: {
          range: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
        aggs: {
          group_by_status: {
            terms: { field: "status.keyword", size: ES_NO_LIMIT },
          },
        },
        size: 0,
        track_total_hits: true,
      };

      if (user.role === ROLES.REFERENT_REGION) {
        body.query = {
          ...body.query,
          bool: {
            filter: [{ term: { "region.keyword": user.region } }],
          },
        };
      }

      const response = await esClient.search({ index: "modificationbus", body });
      notes = notes.concat(response.body.aggregations.group_by_status.buckets.map((e) => ({ ...e, phase: "sejour" })));
      console.log("🚀 ~ file: keynumbers.js:26 ~ response:", response);
    }

    res.status(200).send(notes);
  } catch (error) {
    console.log(error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
