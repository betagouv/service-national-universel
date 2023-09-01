const { ES_NO_LIMIT, ROLES, COHORTS, YOUNG_STATUS, YOUNG_PHASE, formatDateForPostGre } = require("snu-lib");
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

async function getYoungNotesPhase0(startDate, endDate, user) {
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
                    { match: { "notes.phase": "INSCRIPTION" } },
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
      id: "young-notes-phase0",
      value,
      label: `note${value > 1 ? "s" : ""} interne${value > 1 ? "s" : ""} déposée${value > 1 ? "s" : ""} - phase 0`,
      icon: "other",
    },
  ];
}

async function getYoungRegisteredWithParticularSituation(startDate, endDate, user) {
  // ref reg only
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "region.keyword": user.region } },
          {
            range: {
              inscriptionDoneDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },
    aggs: {
      group_by_handicap: {
        terms: { field: "handicap.keyword", size: ES_NO_LIMIT },
      },
      group_by_qpv: {
        terms: { field: "qpv.keyword", size: ES_NO_LIMIT },
      },
      group_by_isRegionRural: {
        terms: { field: "isRegionRural.keyword", size: ES_NO_LIMIT },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "young", body });

  let handicap = response.body.aggregations.group_by_handicap.buckets.find((bucket) => bucket.key === "true")?.doc_count || 0;
  let qpv = response.body.aggregations.group_by_qpv.buckets.find((bucket) => bucket.key === "true")?.doc_count || 0;
  let rural = response.body.aggregations.group_by_isRegionRural.buckets.find((bucket) => bucket.key === "true")?.doc_count || 0;

  return [
    {
      id: "young-rural-registration",
      value: handicap,
      label: ` volontaire${handicap > 1 ? "s" : ""} inscrit${handicap > 1 ? "s" : ""} en situation de handicap`,
      icon: "other",
    },
    {
      id: "young-QPV-registration",
      value: qpv,
      label: ` volontaire${qpv > 1 ? "s" : ""} inscrit${qpv > 1 ? "s" : ""} en quartiers prioritaires`,
      icon: "other",
    },
    {
      id: "young-rural-registration",
      value: rural,
      label: ` volontaire${rural > 1 ? "s" : ""} inscrit${rural > 1 ? "s" : ""} en zones rurales`,
      icon: "other",
    },
  ];
}

async function getDepartmentRegistrationGoal(startDate, endDate, user) {
  // ref reg only
  const cohort = COHORTS[COHORTS.length - 2];
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "region.keyword": user.region } },
          { term: { "cohort.keyword": cohort } },
          {
            range: {
              fillingRate: {
                gte: 100,
              },
            },
          },
        ],
      },
    },
    size: ES_NO_LIMIT,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "inscriptiongoal", body });
  const data = response.body.hits.hits;

  const result = data.map((item) => ({
    id: `${item._source.department}-registration-goal`,
    label: `Le département ${item._source.department} a atteint son objectif d’inscription sur le séjour de ${item._source.cohort}`,
    icon: "other",
  }));
  if (result.length) {
    return result;
  } else {
    return [];
  }
}

async function getRegisterFileOpen(startDate, endDate, user) {
  // ref reg, ref dep, admin
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
    size: 0,
    track_total_hits: true,
  };
  if (user.role === ROLES.REFERENT_REGION) {
    body.query.bool.filter.push({ match: { "region.keyword": user.region } });
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.query.bool.filter.push({ terms: { "department.keyword": user.department } });
  }

  const response = await esClient.search({ index: "young", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "register-file-open",
      value: value,
      label: ` dossier${value > 1 ? "s" : ""} d'inscription ouvert${value > 1 ? "s" : ""}`,
      icon: "other",
    },
  ];
}

async function getAbandonedRegistration(startDate, endDate, user) {
  // ref reg only
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "region.keyword": user.region } },
          { term: { "phase.keyword": YOUNG_PHASE.INSCRIPTION } },
          { term: { "status.keyword": YOUNG_STATUS.ABANDONED } },
          {
            range: {
              lastStatusAt: {
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
      id: "abandoned-registration",
      value: value,
      label: ` inscription${value > 1 ? "s" : ""} abandonnée${value > 1 ? "s" : ""}`,
      icon: "other",
    },
  ];
}

async function getYoungVaildatedonWaitingList(startDate, endDate, user) {
  // ref dep only
  const token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
    status: YOUNG_STATUS.VALIDATED,
  };

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.department = user.department;
  }
  if (user.role === ROLES.REFERENT_REGION) {
    body.region = user.region;
  }

  const response = await fetch(`${API_ANALYTICS_ENDPOINT}/stats/young-validated-waitingList/count`, {
    ...postParams(token),
    body: JSON.stringify(body),
  });

  const result = await response.json();
  console.log(result);
  const value = result?.data;

  return [
    {
      id: "young-validated-waitingList",
      value: value,
      label: ` dossier${value > 1 ? "s" : ""} d'inscription validé${value > 1 ? "s" : ""} sur liste complémentaire`,
      icon: "other",
    },
  ];
}

module.exports = {
  getYoungNotesPhase0,
  getYoungRegisteredWithParticularSituation,
  getDepartmentRegistrationGoal,
  getRegisterFileOpen,
  getAbandonedRegistration,
};
