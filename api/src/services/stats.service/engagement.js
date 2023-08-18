const { ES_NO_LIMIT, ROLES, YOUNG_STATUS_PHASE2, CONTRACT_STATUS, COHESION_STAY_END, APPLICATION_STATUS, MISSION_STATUS } = require("snu-lib");
const esClient = require("../../es");

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
    size: ES_NO_LIMIT,
    track_total_hits: true,
  };

  const response2 = await esClient.search({ index: "contract", body: body2 });

  let value = response2.body.aggregations.group_by_youngId.buckets;

  value = value.filter((bucket) => {
    const minYoungContractValidationDate = new Date(bucket.minYoungContractValidationDate.value);
    const correspondingYoung = youngsCohort.find((young) => young._id === bucket.key);

    //check si la date de validation de contract est moins d'un an après la date de validation de phase 1 du jeune
    if (correspondingYoung) {
      const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;
      const cohortEnd = COHESION_STAY_END[correspondingYoung.cohort];

      if (minYoungContractValidationDate - cohortEnd < oneYearInMilliseconds) {
        return minYoungContractValidationDate >= new Date(startDate) && minYoungContractValidationDate <= new Date(endDate);
      }
    }
    //return minYoungContractValidationDate >= new Date(startDate) && minYoungContractValidationDate <= new Date(endDate);
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

async function getApplicationsCanceled(startDate, endDate, user) {
  // Responsible && Supervisor only
  let body = {
    query: {
      bool: {
        filter: [
          { terms: { "status.keyword": APPLICATION_STATUS.CANCEL } },
          {
            range: {
              updatedAt: {
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

  if (user.role === ROLES.SUPERVISOR) {
    body.query.bool.filter.push({ match: { "tutorId.keyword": user._id } });
  }
  if (user.role === ROLES.RESPONSIBLE) {
    body.query.bool.filter.push({ match: { "structureId.keyword": user.structureId } });
  }

  const response = await esClient.search({ index: "application", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "applications-canceled",
      value: value,
      label: ` candidature${value > 1 ? "s" : ""} annulée${value > 1 ? "s" : ""}`,
      icon: "action",
    },
  ];
}

async function getMissionsWaitingForValidation(startDate, endDate, user) {
  // moderator only
  let body = {
    query: {
      bool: {
        filter: [
          { term: { "status.keyword": MISSION_STATUS.WAITING_VALIDATION } },
          {
            range: {
              updatedAt: {
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

  const response = await esClient.search({ index: "mission", body });
  const value = response.body.hits.total.value;

  return [
    {
      id: "missions-waiting-for-validation",
      value: value,
      label: ` mission${value > 1 ? "s" : ""} soumise${value > 1 ? "s" : ""} à validation`,
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
        filter: [
          { terms: { "youngId.keyword": youngsIds } },
          { term: { "youngContractStatus.keyword": CONTRACT_STATUS.VALIDATED } },
          {
            range: {
              missionStartAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },
    size: ES_NO_LIMIT,
    track_total_hits: true,
  };

  if (user.role === ROLES.SUPERVISOR) {
    body2.query.bool.filter.push({ match: { "tutorId.keyword": user._id } });
  }
  if (user.role === ROLES.RESPONSIBLE) {
    body2.query.bool.filter.push({ match: { "structureId.keyword": user.structureId } });
  }

  const response2 = await esClient.search({ index: "contract", body: body2 });
  const startedMissions = response2.body.hits.total.value;

  let body3 = {
    query: {
      bool: {
        filter: [
          { terms: { "youngId.keyword": youngsIds } },
          { term: { "youngContractStatus.keyword": CONTRACT_STATUS.VALIDATED } },
          {
            range: {
              missionEndAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          },
        ],
      },
    },
    size: ES_NO_LIMIT,
    track_total_hits: true,
  };

  if (user.role === ROLES.SUPERVISOR) {
    body3.query.bool.filter.push({ match: { "tutorId.keyword": user._id } });
  }
  if (user.role === ROLES.RESPONSIBLE) {
    body3.query.bool.filter.push({ match: { "structureId.keyword": user.structureId } });
  }

  const response3 = await esClient.search({ index: "contract", body: body2 });
  const finishedMissions = response3.body.hits.total.value;

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

module.exports = {
  getNewMissions,
  getNewStructures,
  getYoungNotesPhase2,
  getYoungPhase2Validated,
  getYoungStartPhase2InTime,
  getApplicationsCanceled,
  getMissionsWaitingForValidation,
  getYoungsWhoStartedOrFinishedMissions,
};
