const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildNdJson, joiElasticSearch, buildRequestBody } = require("./utils");
const { ES_NO_LIMIT, canSearchLigneBus, canSearchInElasticSearch, ROLES } = require("snu-lib");
const { allRecords } = require("../../es/utils");

async function getTransportCorrectionRequests(startDate, endDate, user) {
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

  return [
    {
      id: "pdt-modificationbuses-refused",
      value: response.body.aggregations.group_by_status.buckets.find((e) => e.key === "REJECTED")?.doc_count || 0,
      label: "demandes de modification du plan de transport refusées",
      icon: "action",
    },
    {
      id: "pdt-modificationbuses-validated",
      value: response.body.aggregations.group_by_status.buckets.find((e) => e.key === "ACCEPTED")?.doc_count || 0,
      label: "demandes de modification du plan de transport validées",
      icon: "action",
    },
  ];
}

async function getSessionNotes(startDate, endDate) {
  let body = {
    query: {
      range: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "session", body });

  return [
    {
      id: "session-creation",
      value: response.body.hits.total.value,
      label: "centres rattachés à une session",
      icon: "where",
    },
  ];
}

router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const user = req.user;
    if (!canSearchInElasticSearch(user, "modificationbus")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const { notesFromDate: startDate, notesToDate: endDate, notesPhase } = req.body;

    let notes = [];

    if (["all", "sejour"].includes(notesPhase)) {
      const pdtNotes = await getTransportCorrectionRequests(startDate, endDate, user);
      notes.push(...pdtNotes);

      if (user.role === ROLES.ADMIN) {
        const sessionNotes = await getSessionNotes(startDate, endDate);
        notes.push(...sessionNotes);
      }
    }

    res.status(200).send({ ok: true, data: notes });
  } catch (error) {
    console.log(error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
