const { DASHBOARD_TODOS_FUNCTIONS, ROLES, region2department } = require("snu-lib");
const { buildArbitratyNdJson, buildMissionContext, buildApplicationContext } = require("../../controllers/elasticsearch/utils");
const { esClient } = require("../../es");
const { queryFromFilter, withAggs } = require("./todo.helper");
const service = {};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC] = async (user) => {
  const response = await esClient().msearch({
    index: "application",
    body: buildArbitratyNdJson(
      // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
      // engagement_contrat_à_éditer
      { index: "young", type: "_doc" },
      queryFromFilter(
        user.role,
        user.region,
        user.department,
        [
          { terms: { "status.keyword": ["VALIDATED"] } },
          { terms: { "statusPhase2.keyword": ["WAITING_REALISATION", "IN_PROGRESS"] } },
          { terms: { "phase2ApplicationStatus.keyword": ["VALIDATED", "IN_PROGRESS"] } },
          { terms: { "statusPhase2Contract.keyword": ["DRAFT"] } },
        ],
        {
          regionField: "youngRegion",
          departmentField: "youngDepartment",
        },
      ),
      // Contrat (À suivre) X contrats d’engagement sont en attente de signature.
      // engagement_contrat_en_attente_de_signature
      { index: "young", type: "_doc" },
      queryFromFilter(
        user.role,
        user.region,
        user.department,
        [
          { terms: { "status.keyword": ["VALIDATED"] } },
          { terms: { "statusPhase2.keyword": ["WAITING_REALISATION", "IN_PROGRESS"] } },
          { terms: { "phase2ApplicationStatus.keyword": ["VALIDATED", "IN_PROGRESS"] } },
          { terms: { "statusPhase2Contract.keyword": ["SENT"] } },
        ],
        {
          regionField: "youngRegion",
          departmentField: "youngDepartment",
        },
      ),
      // Dossier d’éligibilité (À vérifier)  X dossiers d’éligibilité en préparation militaire sont en attente de vérification.
      // engagement_dossier_militaire_en_attente_de_validation
      { index: "young", type: "_doc" },
      queryFromFilter(
        user.role,
        user.region,
        user.department,
        [{ terms: { "status.keyword": ["VALIDATED"] } }, { terms: { "statusMilitaryPreparationFiles.keyword": ["WAITING_VERIFICATION"] } }],
        {
          regionField: "youngRegion",
          departmentField: "youngDepartment",
        },
      ),
      // Mission (À instruire) X missions sont en attente de validation
      // engagement_mission_en_attente_de_validation
      { index: "mission", type: "_doc" },
      queryFromFilter(user.role, user.region, user.department, [{ terms: { "status.keyword": ["WAITING_VALIDATION"] } }], {
        regionField: "youngRegion",
        departmentField: "youngDepartment",
      }),
      // Phase 3 (À suivre) X demandes de validation de phase 3 à suivre
      // engagement_phase3_en_attente_de_validation
      { index: "young", type: "_doc" },
      queryFromFilter(user.role, user.region, user.department, [{ terms: { "status.keyword": ["VALIDATED"] } }, { terms: { "statusPhase3.keyword": ["WAITING_VALIDATION"] } }], {
        regionField: "youngRegion",
        departmentField: "youngDepartment",
      }),
      // Équivalence (À vérifier) X demandes d’équivalence MIG sont en attente de vérification.
      { index: "young", type: "_doc" },
      queryFromFilter(
        user.role,
        user.region,
        user.department,
        [{ terms: { "status.keyword": ["VALIDATED"] } }, { terms: { "status_equivalence.keyword": ["WAITING_VERIFICATION"] } }],
        {
          regionField: "youngRegion",
          departmentField: "youngDepartment",
        },
      ),
    ),
  });
  const results = response.body.responses;
  return {
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.CONTRACT_TO_EDIT]: results[0].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.CONTRACT_TO_SIGN]: results[1].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.MILITARY_FILE_TO_VALIDATE]: results[2].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.MISSION_TO_VALIDATE]: results[3].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.PHASE3_TO_VALIDATE]: results[4].hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.EQUIVALENCE_WAITING_VERIFICATION]: results[5].hits.total.value,
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MANAGER] = async (user) => {
  const response = await esClient().msearch({
    index: "departmentservice",
    body: buildArbitratyNdJson(
      { index: "departmentservice", type: "_doc" },
      withAggs(
        {
          size: 0,
          track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
          query: {
            bool: {
              must: [{ terms: { "department.keyword": user.role === ROLES.REFERENT_DEPARTMENT ? user.department : region2department[user.region] } }],
              filter: {
                nested: {
                  path: "representantEtat",
                  query: { bool: { must_not: { exists: { field: "representantEtat.email.keyword" } } } },
                },
              },
            },
          },
        },
        "department.keyword",
      ),
    ),
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MANAGER]: response.body.responses[0].aggregations.department.buckets.map((e) => ({
      department: e.key,
      count: e.doc_count,
    })),
  };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT] = async (user) => {
  let missionContextFilters = [];
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    const { missionContextFilters: mCtxF, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      throw new Error(missionContextError.status, missionContextError.body);
    }
    missionContextFilters = mCtxF;
  }

  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { range: { startAt: { gt: "now" } } },
            user.role === ROLES.REFERENT_REGION ? { term: { "region.keyword": user.region } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": user.department } } : null,
            ...missionContextFilters,
          ].filter(Boolean),
        },
      },
    },
  });

  const missionIds = missions.body.hits.hits.map((e) => e._id);
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          must_not: {
            term: {
              "contractStatus.keyword": "VALIDATED",
            },
          },
          filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": ["IN_PROGRESS"] } }],
        },
      },
    },
  });

  const youngIds = applications.body.hits.hits.map((e) => e._source.youngId);
  const youngs = await esClient().search({
    index: "young",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { _id: youngIds } }, { terms: { "statusPhase2.keyword": ["IN_PROGRESS"] } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT]: youngs.body.hits.total.value };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS] = async (user) => {
  let missionContextFilters = [];
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    const { missionContextFilters: mCtxF, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      throw new Error(missionContextError.status, missionContextError.body);
    }
    missionContextFilters = mCtxF;
  }

  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { range: { startAt: { lt: "now" } } },
            { range: { endAt: { gt: "now" } } },
            user.role === ROLES.REFERENT_REGION ? { term: { "region.keyword": user.region } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": user.department } } : null,
            ...missionContextFilters,
          ].filter(Boolean),
        },
      },
    },
  });

  const missionIds = missions.body.hits.hits.map((e) => e._id);
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  const youngIds = applications.body.hits.hits.map((e) => e._source.youngId);
  const youngs = await esClient().search({
    index: "young",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { _id: youngIds } }, { terms: { "statusPhase2.keyword": ["IN_PROGRESS"] } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS]: youngs.body.hits.total.value };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END] = async (user) => {
  let missionContextFilters = [];
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    const { missionContextFilters: mCtxF, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      throw new Error(missionContextError.status, missionContextError.body);
    }
    missionContextFilters = mCtxF;
  }

  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { range: { endAt: { lt: "now" } } },
            user.role === ROLES.REFERENT_REGION ? { term: { "region.keyword": user.region } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": user.department } } : null,
            ...missionContextFilters,
          ].filter(Boolean),
        },
      },
    },
  });

  const missionIds = missions.body.hits.hits.map((e) => e._id);
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": ["VALIDATED", "IN_PROGRESS"] } }],
        },
      },
    },
  });

  const youngIds = applications.body.hits.hits.map((e) => e._source.youngId);
  const youngs = await esClient().search({
    index: "young",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { _id: youngIds } }, { terms: { "statusPhase2.keyword": ["IN_PROGRESS"] } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END]: youngs.body.hits.total.value };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_END] = async (user) => {};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START] = async (user) => {
  let missionContextFilters = [];
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    const { missionContextFilters: mCtxF, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      throw new Error(missionContextError.status, missionContextError.body);
    }
    missionContextFilters = mCtxF;
  }

  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { range: { startAt: { lt: "now" } } },
            { range: { endAt: { gt: "now" } } },
            user.role === ROLES.REFERENT_REGION ? { term: { "region.keyword": [user.region] } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": user.department } } : null,
            ...missionContextFilters,
          ].filter(Boolean),
        },
      },
    },
  });

  const missionIds = missions.body.hits.hits.map((e) => e._id);
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": ["IN_PROGRESS"] } }],
        },
      },
    },
  });

  const youngIds = applications.body.hits.hits.map((e) => e._source.youngId);
  const youngs = await esClient().search({
    index: "young",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { _id: youngIds } }, { terms: { "statusPhase2.keyword": ["IN_PROGRESS"] } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START]: youngs.body.hits.total.value };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START] = async (user) => {
  let missionContextFilters = [];
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    const { missionContextFilters: mCtxF, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      throw new Error(missionContextError.status, missionContextError.body);
    }
    missionContextFilters = mCtxF;
  }

  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { range: { startAt: { lt: "now" } } },
            user.role === ROLES.REFERENT_REGION ? { term: { "region.keyword": [user.region] } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": user.department } } : null,
            ...missionContextFilters,
          ].filter(Boolean),
        },
      },
    },
  });

  const missionIds = missions.body.hits.hits.map((e) => e._id);
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          must_not: {
            term: {
              "contractStatus.keyword": "VALIDATED",
            },
          },
          filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": ["VALIDATED", "IN_PROGRESS"] } }],
        },
      },
    },
  });

  const youngIds = applications.body.hits.hits.map((e) => e._source.youngId);
  const youngs = await esClient().search({
    index: "young",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ terms: { _id: youngIds } }, { terms: { "statusPhase2.keyword": ["IN_PROGRESS"] } }, { terms: { "status.keyword": ["VALIDATED"] } }],
        },
      },
    },
  });

  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START]: youngs.body.hits.total.value };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC_FOR_RESP] = async (user) => {
  const { missionContextFilters, missionContextError } = await buildMissionContext(user);
  if (missionContextError) {
    throw new Error(missionContextError.status, missionContextError.body);
  }

  const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
  if (missionContextError) {
    throw new Error(applicationContextError.status, applicationContextError.body);
  }

  // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
  const contract = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            ...applicationContextFilters,
            {
              term: {
                "contractStatus.keyword": "DRAFT",
              },
            },
            { terms: { "status.keyword": ["VALIDATED", "IN_PROGRESS", "DONE"] } },
          ],
        },
      },
      size: 0,
      track_total_hits: 1000,
    },
  });
  //Missions (À corriger) X missions sont en attente de correction.
  const missions = await esClient().search({
    index: "mission",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [...missionContextFilters, { term: { "status.keyword": "WAITING_CORRECTION" } }],
        },
      },
      size: 0,
      track_total_hits: 1000,
    },
  });

  //Candidatures (À traiter) X candidatures sont en attente de validation.
  const applications = await esClient().search({
    index: "application",
    body: {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            ...applicationContextFilters,
            {
              term: {
                "status.keyword": "WAITING_VALIDATION",
              },
            },
          ],
        },
      },
      size: 0,
      track_total_hits: 1000,
    },
  });

  return {
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_CONTRACT_TO_EDIT]: contract.body.hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MISSION_TO_CORRECT]: missions.body.hits.total.value,
    [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_APPLICATION_TO_VALIDATE]: applications.body.hits.total.value,
  };
};

module.exports = service;
