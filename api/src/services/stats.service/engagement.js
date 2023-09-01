const { ES_NO_LIMIT, ROLES, YOUNG_STATUS_PHASE2, CONTRACT_STATUS, COHESION_STAY_END, APPLICATION_STATUS, MISSION_STATUS, formatDateForPostGre } = require("snu-lib");
const esClient = require("../../es");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");

async function getAccessToken(endpoint, apiKey) {
  const response = await fetch(`${endpoint}/auth/token`, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();
  if (data.ok == true && data.token) {
    return data.token;
  } else {
    throw new Error("Couldn't retrieve auth token");
  }
}

function postParams(token) {
  return {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
}

async function getNewStructures(startDate, endDate, user) {
  // ref dep only
  let body = {
    query: {
      bool: {
        filter: [
          { terms: { "department.keyword": user.department } },
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
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "structure", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "new-structures",
      value: value,
      label: ` nouvelle${value > 1 ? "s" : ""} structure${value > 1 ? "s" : ""} inscrite${value > 1 ? "s" : ""}`,
      icon: "action",
    },
  ];
}

async function getYoungNotesPhase2(startDate, endDate, user) {
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
                    { match: { "notes.phase": "PHASE_2" } },
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

  const response = await esClient.search({ index: "young", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "young-notes-phase2",
      value: value,
      label: `note${value > 1 ? "s" : ""} interne${value > 1 ? "s" : ""} déposée${value > 1 ? "s" : ""} - phase 2`,
      icon: "action",
    },
  ];
}

async function getYoungPhase2Validated(startDate, endDate, user) {
  // ref reg only
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "region.keyword": user.region } },
          { term: { "statusPhase2.keyword": YOUNG_STATUS_PHASE2.VALIDATED } },
          {
            range: {
              statusPhase2ValidatedAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "young", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "young-phase2-validated",
      value: value,
      label: ` volontaire${value > 1 ? "s" : ""} ayant validé leur phase 2`,
      icon: "action",
    },
  ];
}

async function getMissionsOnTerm(startDate, endDate, user) {
  // ref dep && responsible && supervisor
  let body = {
    query: {
      bool: {
        filter: [
          {
            range: {
              endAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },
    size: 0,
    track_total_hits: true,
  };
  switch (user.role) {
    case ROLES.RESPONSIBLE:
    case ROLES.SUPERVISOR:
      body.query.bool.filter.push({ match: { "structureId.keyword": user.structureId } });
      break;

    case ROLES.REFERENT_DEPARTMENT:
      body.query.bool.filter.push({ terms: { "department.keyword": user.department } });
      break;
    default:
      break;
  }

  const response = await esClient.search({ index: "mission", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "missions-on-term",
      value: value,
      label: ` mission${value > 1 ? "s" : ""} arrivée${value > 1 ? "s" : ""} à échéance`,
      icon: "action",
    },
  ];
}

async function getContractsSigned(startDate, endDate, user) {
  // ref dep && admin
  const token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
    status: APPLICATION_STATUS.VALIDATED,
  };
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.department = user.department;
  }

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/stats/application-contract-signed/count`, {
    ...postParams(token),
    body: JSON.stringify(body),
  });

  const result = await response.json();
  const applicationId = result?.data.map((e) => e.candidature_id);
  let body2 = {
    query: {
      bool: {
        filter: [
          { terms: { "applicationId.keyword": applicationId } },
          { term: { "youngContractStatus.keyword": CONTRACT_STATUS.VALIDATED } },
          {
            range: {
              youngContractValidationDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },

    size: 0,
    track_total_hits: true,
  };

  const response2 = await esClient.search({ index: "contract", body: body2 });
  const value = response2.body.hits.total.value;

  return [
    {
      id: "contract-signed",
      value: value,
      label: ` contrat${value > 1 ? "s" : ""} d'engagement signé${value > 1 ? "s" : ""}`,
      icon: "action",
    },
  ];
}

module.exports = {
  getYoungNotesPhase2,
  getNewStructures,
  getYoungPhase2Validated,
  getMissionsOnTerm,
  getContractsSigned,
};
