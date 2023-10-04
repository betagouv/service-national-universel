const { DASHBOARD_TODOS_FUNCTIONS, ROLES, region2department } = require("snu-lib");
const { buildArbitratyNdJson } = require("../../controllers/elasticsearch/utils");
const esClient = require("../../es");
const ApplicationModel = require("../../models/application");
const { queryFromFilter, withAggs } = require("./todo.helper");
const service = {};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC] = async (user) => {
  const response = await esClient.msearch({
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

  const response = await esClient.msearch({
    index: "departmentservice",
    body: buildArbitratyNdJson(
      { index: "departmentservice", type: "_doc" },
      withAggs(
        {
          size: 0,
          track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
          query: {
            bool: {
              must: { match_all: {} },
              filter: {
                bool: {
                  must: [{ terms: { "department.keyword": user.role === ROLES.REFERENT_DEPARTMENT ? user.department : region2department[user.region] } }],
                  must_not: { exists: { field: "representantEtat.email.keyword" } },
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
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        status: { $in: ["IN_PROGRESS"] },
        // statusPhase2: { $in: ["IN_PROGRESS", "WAITING_REALISATION"] },
        contractStatus: { $nin: ["VALIDATED"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.startAt": { $gt: new Date() },
      },
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT]: result.length };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS] = async (user) => {
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        status: { $in: ["VALIDATED"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.startAt": { $gt: new Date() },
        "missionInfo.endAt": { $lt: new Date() },
      },
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS]: result.length };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END] = async (user) => {
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        status: { $in: ["VALIDATED", "IN_PROGRESS"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.endAt": { $lt: new Date() },
      },
    },
    {
      $limit: 1000,
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END]: result.length };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_END] = async (user) => {
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        status: { $nin: ["VALIDATED"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.endAt": { $lt: new Date() },
      },
    },
    {
      $limit: 1000,
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_END]: result.length };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START] = async (user) => {
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        status: { $nin: ["IN_PROGRESS"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.startAt": { $lt: new Date() },
        "missionInfo.endAt": { $gt: new Date() },
      },
    },
    {
      $limit: 1000,
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START]: result.length };
};

service[DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START] = async (user) => {
  const match = { "youngInfo.statusPhase2": "IN_PROGRESS", "youngInfo.status": "VALIDATED" };
  if (user.role === ROLES.REFERENT_REGION) match["youngInfo.region"] = user.region;
  if (user.role === ROLES.REFERENT_DEPARTMENT) match["youngInfo.department"] = { $in: user.department };
  const query = [
    {
      $match: {
        contractStatus: { $nin: ["VALIDATED"] },
        youngId: { $exists: true, $ne: "N/A" },
        missionId: { $exists: true },
      },
    },
    {
      $addFields: {
        youngObjectId: {
          $toObjectId: "$youngId",
        },
        missionObjectId: {
          $toObjectId: "$missionId",
        },
      },
    },
    {
      $lookup: {
        from: "youngs",
        localField: "youngObjectId",
        foreignField: "_id",
        as: "youngInfo",
      },
    },
    {
      $unwind: "$youngInfo",
    },
    {
      $match: match,
    },
    {
      $lookup: {
        from: "missions",
        localField: "missionObjectId",
        foreignField: "_id",
        as: "missionInfo",
      },
    },
    {
      $unwind: "$missionInfo",
    },
    {
      $match: {
        "missionInfo.startAt": { $lt: new Date() },
      },
    },
    {
      $limit: 1000,
    },
  ];
  const result = await ApplicationModel.aggregate(query);
  return { [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START]: result.length };
};

module.exports = service;
