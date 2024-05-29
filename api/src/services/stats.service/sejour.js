const { ES_NO_LIMIT, ROLES } = require("snu-lib");
const { esClient } = require("../../es");

async function getYoungNotesPhase1(startDate, endDate, user) {
  // ref dep only
  let body = {
    query: {
      bool: {
        filter: [
          { terms: { "department.keyword": user.department } },
          {
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
        ],
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient().search({ index: "young", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "young-notes",
      value,
      label: `note${value > 1 ? "s" : ""} interne${value > 1 ? "s" : ""} déposée${value > 1 ? "s" : ""} - phase 1`,
      icon: "where",
    },
  ];
}

async function getTimeScheduleAndPedagoProject(startDate, endDate, user) {
  // ref dep and ref reg
  let body = {
    query: {
      bool: {
        filter: [],
      },
    },
    aggs: {
      group_by_timeSchedule: {
        filter: {
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
      },
      group_by_pedagoProject: {
        filter: {
          nested: {
            path: "pedagoProjectFiles",
            query: {
              range: {
                "pedagoProjectFiles.uploadedAt": {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            },
          },
        },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  if (user.role === ROLES.REFERENT_REGION) {
    body.query.bool.filter.push({ match: { "region.keyword": user.region } });
  }
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.query.bool.filter.push({ terms: { "department.keyword": user.department } });
  }

  const response = await esClient().search({ index: "sessionphase1", body });
  const time = response.body.aggregations.group_by_timeSchedule.doc_count;
  const project = response.body.aggregations.group_by_pedagoProject.doc_count;

  return [
    {
      id: "time-schedule",
      value: time,
      label: ` emploi${time > 1 ? "s" : ""} du temps déposé${time > 1 ? "s" : ""}`,
      icon: "where",
    },
    {
      id: "pedago-project",
      value: project,
      label: ` projet${project > 1 ? "s" : ""} pédagogique${project > 1 ? "s" : ""} déposé${project > 1 ? "s" : ""}`,
      icon: "where",
    },
  ];
}

async function getTransportCorrectionRequests(startDate, endDate, user) {
  // ref reg and admin
  let body = {
    query: {
      bool: {
        filter: [
          {
            range: {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
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
    body.query.bool.filter.push({ match: { "region.keyword": user.region } });
  }

  const response = await esClient().search({ index: "modificationbus", body });
  const refusedCount = response.body.aggregations.group_by_status.buckets.find((e) => e.key === "REJECTED")?.doc_count || 0;
  const validatedCount = response.body.aggregations.group_by_status.buckets.find((e) => e.key === "ACCEPTED")?.doc_count || 0;

  return [
    {
      id: "pdt-modificationbuses-refused",
      value: refusedCount,
      label: `demande${refusedCount > 1 ? "s" : ""} de modification du plan de transport refusée${refusedCount > 1 ? "s" : ""}`,
      icon: "where",
    },
    {
      id: "pdt-modificationbuses-validated",
      value: validatedCount,
      label: `demande${validatedCount > 1 ? "s" : ""} de modification du plan de transport validée${validatedCount > 1 ? "s" : ""}`,
      icon: "where",
    },
  ];
}

async function getSessions(startDate, endDate) {
  // admin only
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

  const response = await esClient().search({ index: "sessionphase1", body });
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
  // admin only
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

  const response = await esClient().search({ index: "lignetopoint", body });
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
  getYoungNotesPhase1,
  getTimeScheduleAndPedagoProject,
  getTransportCorrectionRequests,
  getSessions,
  getLineToPoints,
};
