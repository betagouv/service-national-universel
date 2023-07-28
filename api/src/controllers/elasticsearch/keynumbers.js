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

    if (["all", "sejour"].includes(notesPhase)) {
      const pdtNotes = await getTransportCorrectionRequests(startDate, endDate, user);
      notes.push(...pdtNotes);

      if (user.role === ROLES.ADMIN) {
        const sessionNotes = await getSessionNotes(startDate, endDate);
        notes.push(...sessionNotes);
        const lineToPoints = await getLineToPoints(startDate, endDate);
        notes.push(...lineToPoints);
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

  const refusedCount = response.body.aggregations.group_by_status.buckets.find((e) => e.key === "REJECTED")?.doc_count || 0;
  const validatedCount = response.body.aggregations.group_by_status.buckets.find((e) => e.key === "ACCEPTED")?.doc_count || 0;

  return [
    {
      id: "pdt-modificationbuses-refused",
      value: refusedCount,
      label: `demande${refusedCount > 1 && "s"} de modification du plan de transport refusée${refusedCount > 1 && "s"}`,
      icon: "action",
    },
    {
      id: "pdt-modificationbuses-validated",
      value: validatedCount,
      label: `demande${validatedCount > 1 && "s"} de modification du plan de transport validée${validatedCount > 1 && "s"}`,
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

  const value = response.body.hits.total.value;

  return [
    {
      id: "session-creation",
      value,
      label: `centre${value > 1 && "s"} rattaché${value > 1 && "s"} à une session`,
      icon: "where",
    },
  ];
}

async function getLineToPoints(startDate, endDate) {
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
      group_by_meetingPointId: {
        terms: { field: "meetingPointId.keyword", size: ES_NO_LIMIT },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "lignetopoint", body });

  return [
    {
      id: "lignebus-creation",
      value: response.body.aggregations.group_by_meetingPointId.buckets.length,
      label: "points de rassemblement rattachés à un centre",
      icon: "where",
    },
  ];
}
