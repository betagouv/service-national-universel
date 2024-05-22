const { ES_NO_LIMIT, ROLES, YOUNG_STATUS_PHASE2, CONTRACT_STATUS, END_DATE_PHASE1, APPLICATION_STATUS, MISSION_STATUS, formatDateForPostGre } = require("snu-lib");
const esClient = require("../../es");
const CohortModel = require("../../models/cohort");
const config = require("config");

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
  const token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
    status: APPLICATION_STATUS.VALIDATED,
  };
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.department = user.department;
  }

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/stats/application-contract-signed`, {
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

async function getYoungsWhoStartedOrFinishedMissions(startDate, endDate, user) {
  // moderator / ref dep / supervisor / responsible
  let body = {
    query: {
      bool: {
        filter: [{ term: { "statusPhase2.keyword": YOUNG_STATUS_PHASE2.IN_PROGRESS } }, { terms: { "statusPhase2Contract.keyword": [CONTRACT_STATUS.VALIDATED] } }],
      },
    },
    size: ES_NO_LIMIT,
    track_total_hits: true,
    _source: false,
  };

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    body.query.bool.filter.push({ terms: { "department.keyword": user.department } });
  }

  const response = await esClient.search({ index: "young", body });
  const youngs = response.body.hits.hits;
  const youngsIds = youngs.map((young) => young._id);

  let body2 = {
    query: {
      bool: {
        filter: [{ terms: { "youngId.keyword": youngsIds } }, { term: { "youngContractStatus.keyword": CONTRACT_STATUS.VALIDATED } }],
      },
    },
    aggs: {
      missionStartAtDocs: {
        filter: {
          range: {
            missionStartAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
      },
      missionEndAtDocs: {
        filter: {
          range: {
            missionEndAt: {
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
  if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) {
    body2.query.bool.filter.push({ match: { "structureId.keyword": user.structureId } });
  }
  const response2 = await esClient.search({ index: "contract", body: body2 });
  const startedMissions = response2.body.aggregations.missionStartAtDocs.doc_count;
  const finishedMissions = response2.body.aggregations.missionEndAtDocs.doc_count;

  return [
    {
      id: "young-who-started-missions",
      value: startedMissions,
      label: ` volontaire${startedMissions > 1 ? "s" : ""} ayant commencé une mission`,
      icon: "action",
    },
    {
      id: "young-who-finished-missions",
      value: finishedMissions,
      label: ` volontaire${finishedMissions > 1 ? "s" : ""} ayant terminé une mission`,
      icon: "action",
    },
  ];
}

async function getMissionsChangeStatus(startDate, endDate, user) {
  //ref dep,responsable,supervisor,admin
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
  };
  switch (user.role) {
    case ROLES.REFERENT_DEPARTMENT:
      body.status = [MISSION_STATUS.WAITING_CORRECTION, MISSION_STATUS.VALIDATED, MISSION_STATUS.REFUSED];
      body.department = user.department;
      break;

    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      body.status = [MISSION_STATUS.VALIDATED, MISSION_STATUS.REFUSED];
      body.structureId = user.structureId;
      break;

    case ROLES.ADMIN:
      body.status = [MISSION_STATUS.WAITING_CORRECTION, MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.VALIDATED, MISSION_STATUS.REFUSED];
      break;

    default:
      break;
  }

  const token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);
  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/stats/mission-change-status`, {
    ...postParams(token),
    body: JSON.stringify(body),
  });
  const result = await response.json();
  const data = result?.data;
  let resultArray = {
    [MISSION_STATUS.WAITING_CORRECTION]: 0,
    [MISSION_STATUS.WAITING_VALIDATION]: 0,
    [MISSION_STATUS.VALIDATED]: 0,
    [MISSION_STATUS.REFUSED]: 0,
  };

  for (const item of data) {
    const value = item.evenement_valeur;
    if (Object.prototype.hasOwnProperty.call(resultArray, value)) {
      resultArray[value]++;
    }
  }
  const correctionValue = resultArray[MISSION_STATUS.WAITING_CORRECTION];
  const validationValue = resultArray[MISSION_STATUS.WAITING_VALIDATION];
  const validatedValue = resultArray[MISSION_STATUS.VALIDATED];
  const refusedValue = resultArray[MISSION_STATUS.REFUSED];

  const returnArray = {
    [MISSION_STATUS.WAITING_CORRECTION]: {
      id: "missions-waiting-for-correction",
      value: correctionValue,
      label: ` mission${correctionValue > 1 ? "s" : ""} mise${correctionValue > 1 ? "s" : ""} en correction`,
      icon: "action",
    },
    [MISSION_STATUS.WAITING_VALIDATION]: {
      id: "missions-waiting-for-validation",
      value: validationValue,
      label: ` mission${validationValue > 1 ? "s" : ""} soumise${validationValue > 1 ? "s" : ""} a validation`,
      icon: "action",
    },
    [MISSION_STATUS.VALIDATED]: {
      id: "missions-validated",
      value: validatedValue,
      label: ` mission${validatedValue > 1 ? "s" : ""} validée${validatedValue > 1 ? "s" : ""}`,
      icon: "action",
    },
    [MISSION_STATUS.REFUSED]: {
      id: "missions-refused",
      value: refusedValue,
      label: ` mission${refusedValue > 1 ? "s" : ""} refusée${refusedValue > 1 ? "s" : ""}`,
      icon: "action",
    },
  };
  switch (user.role) {
    case ROLES.REFERENT_DEPARTMENT:
      return [returnArray[MISSION_STATUS.WAITING_CORRECTION], returnArray[MISSION_STATUS.VALIDATED], returnArray[MISSION_STATUS.REFUSED]];

    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      return [returnArray[MISSION_STATUS.VALIDATED], returnArray[MISSION_STATUS.REFUSED]];

    case ROLES.ADMIN:
      return [
        returnArray[MISSION_STATUS.WAITING_CORRECTION],
        returnArray[MISSION_STATUS.WAITING_VALIDATION],
        returnArray[MISSION_STATUS.VALIDATED],
        returnArray[MISSION_STATUS.REFUSED],
      ];

    default:
      return [];
  }
}

async function getApplicationsChangeStatus(startDate, endDate, user) {
  // responsible && supervisor && ref dep && admin
  const token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
    status: [APPLICATION_STATUS.CANCEL, APPLICATION_STATUS.ABANDON],
  };
  switch (user.role) {
    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      body.structureId = user.structureId;
      break;

    case ROLES.REFERENT_DEPARTMENT:
      body.department = user.department;
      break;
    default:
      break;
  }

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/stats/application-change-status`, {
    ...postParams(token),
    body: JSON.stringify(body),
  });

  const result = await response.json();
  const data = result?.data;
  let resultArray = {
    [APPLICATION_STATUS.CANCEL]: 0,
    [APPLICATION_STATUS.ABANDON]: 0,
  };

  for (const item of data) {
    const value = item.value;
    if (Object.prototype.hasOwnProperty.call(resultArray, value)) {
      resultArray[value]++;
    }
  }
  const canceledValue = resultArray[APPLICATION_STATUS.CANCEL];
  const abandonValue = resultArray[APPLICATION_STATUS.ABANDON];

  switch (user.role) {
    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      return [
        {
          id: "applications-canceled",
          value: canceledValue,
          label: ` candidature${canceledValue > 1 ? "s" : ""} annulée${canceledValue > 1 ? "s" : ""}`,
          icon: "action",
        },
      ];

    case ROLES.REFERENT_DEPARTMENT:
    case ROLES.ADMIN:
      return [
        {
          id: "missions-abandonned",
          value: abandonValue,
          label: ` mission${abandonValue > 1 ? "s" : ""} abandonnée${abandonValue > 1 ? "s" : ""}`,
          icon: "action",
        },
      ];
    default:
      return [];
  }
}

async function getNewMissions(startDate, endDate, user) {
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
    //to avoid duplicata
    aggs: {
      group_by_description: {
        terms: { field: "description.keyword", size: ES_NO_LIMIT },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "mission", body });
  const value = response.body.aggregations.group_by_description.buckets.length;

  return [
    {
      id: "new-missions",
      value: value,
      label: ` nouvelle${value > 1 ? "s" : ""} mission${value > 1 ? "s" : ""} déposée${value > 1 ? "s" : ""}`,
      icon: "action",
    },
  ];
}

async function getProposedMissionsAcceptedOrRefusedByYoung(startDate, endDate, user) {
  // ref dep only
  const token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);
  let body = {
    startDate: formatDateForPostGre(startDate),
    endDate: formatDateForPostGre(endDate),
    status: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED],
    department: user.department,
  };

  const response = await fetch(`${config.API_ANALYTICS_ENDPOINT}/stats/application-accepted-refused`, {
    ...postParams(token),
    body: JSON.stringify(body),
  });

  const result = await response.json();
  const data = result?.data;
  let resultArray = {
    [APPLICATION_STATUS.VALIDATED]: 0,
    [APPLICATION_STATUS.REFUSED]: 0,
  };

  for (const item of data) {
    const value = item.value;
    if (Object.prototype.hasOwnProperty.call(resultArray, value)) {
      resultArray[value]++;
    }
  }
  const validatedValue = resultArray[APPLICATION_STATUS.VALIDATED];
  const refusedValue = resultArray[APPLICATION_STATUS.REFUSED];

  return [
    {
      id: "applications-validated",
      value: validatedValue,
      label: ` proposition${validatedValue > 1 ? "s" : ""} de missions acceptée${validatedValue > 1 ? "s" : ""} par des volontaires`,
      icon: "action",
    },
    {
      id: "applications-refused",
      value: refusedValue,
      label: ` proposition${refusedValue > 1 ? "s" : ""} de missions refusée${refusedValue > 1 ? "s" : ""} par des volontaires`,
      icon: "action",
    },
  ];
}

async function getYoungStartPhase2InTime(startDate, endDate, user) {
  // ref reg only
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "region.keyword": user.region } },
          { terms: { "statusPhase2.keyword": [YOUNG_STATUS_PHASE2.VALIDATED, YOUNG_STATUS_PHASE2.IN_PROGRESS] } },
          { terms: { "statusPhase2Contract.keyword": [CONTRACT_STATUS.VALIDATED] } },
        ],
      },
    },
    size: ES_NO_LIMIT,
    track_total_hits: true,
  };

  const response = await esClient.search({ index: "young", body });
  const youngs = response.body.hits.hits;
  const youngsIds = youngs.map((young) => young._id);
  const youngsCohort = youngs.map((young) => ({
    _id: young._id,
    cohort: young._source.cohort,
  }));

  let body2 = {
    query: {
      bool: {
        filter: [{ terms: { "youngId.keyword": youngsIds } }, { term: { "youngContractStatus.keyword": CONTRACT_STATUS.VALIDATED } }],
      },
    },
    aggs: {
      group_by_youngId: {
        terms: { field: "youngId.keyword", size: ES_NO_LIMIT },
        aggs: {
          minYoungContractValidationDate: {
            min: { field: "youngContractValidationDate" },
          },
        },
      },
    },
    size: 0,
    track_total_hits: true,
  };

  const response2 = await esClient.search({ index: "contract", body: body2 });

  let value = response2.body.aggregations.group_by_youngId.buckets;

  const allCohort = await CohortModel.find({}, "name dateEnd");
  const allCohortEndDate = allCohort.reduce((result, cohort) => {
    result[cohort.name] = new Date(cohort.dateEnd);
    return result;
  }, {});

  value = value.filter((bucket) => {
    const minYoungContractValidationDate = new Date(bucket.minYoungContractValidationDate.value);
    const correspondingYoung = youngsCohort.find((young) => young._id === bucket.key);

    //check si la date de validation de contract est moins d'un an après la date de validation de phase 1 du jeune
    if (correspondingYoung) {
      const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;
      const cohortEnd = allCohortEndDate[correspondingYoung.cohort] || END_DATE_PHASE1[correspondingYoung.cohort];

      if (minYoungContractValidationDate - cohortEnd < oneYearInMilliseconds) {
        return minYoungContractValidationDate >= new Date(startDate) && minYoungContractValidationDate <= new Date(endDate);
      }
    }
  });

  return [
    {
      id: "young-phase2-validated-in-time",
      value: value.length,
      label: ` volontaire${value.length > 1 ? "s" : ""} ayant commencé ${value.length === 1 ? "sa" : "leur"} mission d’intérêt général dans le délai imparti`,
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
  getYoungsWhoStartedOrFinishedMissions,
  getMissionsChangeStatus,
  getApplicationsChangeStatus,
  getNewMissions,
  getProposedMissionsAcceptedOrRefusedByYoung,
  getYoungStartPhase2InTime,
};
