const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { ES_NO_LIMIT, ROLES } = require("snu-lib");
const Joi = require("joi");

router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      phase: Joi.string().valid("inscription", "sejour", "engagement", "all").required(),
    }).validate(req.body, { allowUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const user = req.user;
    const { startDate, endDate, phase } = value;

    let notes = [];

    switch (phase) {
      case "inscription":
        // TODO
        break;
      case "sejour": {
        notes.push(...(await getSejourNotes(startDate, endDate, user)));
        break;
      }
      case "engagement":
        // TODO
        break;
      case "all": {
        notes.push(...(await getSejourNotes(startDate, endDate, user)));
        break;
      }
      default:
        break;
    }

    res.status(200).send({ ok: true, data: notes });
  } catch (error) {
    console.log(error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function getSejourNotes(startDate, endDate, user) {
  let notes = [];

  const pdtNotes = await getTransportCorrectionRequests(startDate, endDate, user);
  notes.push(...pdtNotes);

  if (user.role === ROLES.ADMIN) {
    const sessionNotes = await getSessions(startDate, endDate);
    notes.push(...sessionNotes);
    const lineToPoints = await getLineToPoints(startDate, endDate);
    notes.push(...lineToPoints);
  }

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN].includes(user.role)) {
    const youngNotes = await getYoungNotesPhase1(startDate, endDate);
    notes.push(...youngNotes);
  }

  return notes;
}

async function getYoungNotesPhase1(startDate, endDate) {
  let body = {
    query: {
      nested: {
        path: "notes",
        query: {
          bool: {
            must: [
              { match: { "notes.phase": "PHASE_1" } },
              {
                range: {
                  "notes.createdAt": {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
              },
            ],
          },
        },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "young", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "young-note",
      value,
      label: `note${value > 1 ? "s" : ""} interne${value > 1 ? "s" : ""} déposée${value > 1 ? "s" : ""} - phase 1`,
      icon: "other",
    },
  ];
}

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
      label: `demande${refusedCount > 1 ? "s" : ""} de modification du plan de transport refusée${refusedCount > 1 ? "s" : ""}`,
      icon: "action",
    },
    {
      id: "pdt-modificationbuses-validated",
      value: validatedCount,
      label: `demande${validatedCount > 1 ? "s" : ""} de modification du plan de transport validée${validatedCount > 1 ? "s" : ""}`,
      icon: "action",
    },
  ];
}

async function getSessions(startDate, endDate) {
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
      label: `centre${value > 1 ? "s" : ""} rattaché${value > 1 ? "s" : ""} à une session`,
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
  const value = response.body.aggregations.group_by_meetingPointId.buckets.length || 0;

  return [
    {
      id: "lignebus-creation",
      value,
      label: `point${value ? "s" : ""} de rassemblement rattaché${value > 1 ? "s" : ""} à un centre`,
      icon: "where",
    },
  ];
}

module.exports = router;
