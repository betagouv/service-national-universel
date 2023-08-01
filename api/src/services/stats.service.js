const { ROLES, ES_NO_LIMIT } = require("snu-lib");
const esClient = require("../es");

async function getSejourNotes(startDate, endDate, user) {
  let notes = [];

  if ([ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role)) {
    notes.push(...(await getTransportCorrectionRequests(startDate, endDate, user)));
  }

  if (user.role === ROLES.ADMIN) {
    notes.push(...(await getSessions(startDate, endDate)));
    notes.push(...(await getLineToPoints(startDate, endDate)));
  }

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN].includes(user.role)) {
    notes.push(...(await getYoungNotesPhase1(startDate, endDate)));
  }

  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    notes.push(...(await getTimeSchedule(startDate, endDate, user)));
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

async function getTimeSchedule(startDate, endDate) {
  let body = {
    query: {
      nested: {
        path: "timeScheduleFiles",
        query: {
          range: {
            "timeScheduleFiles.uploadedAt": {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "sessionphase1", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "time-schedule",
      value,
      label: `emploi${value > 1 ? "s" : ""} du temps déposé${value > 1 ? "s" : ""}`,
      icon: "action",
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

module.exports = {
  getSejourNotes,
};
