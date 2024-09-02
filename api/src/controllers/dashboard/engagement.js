const express = require("express");
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { ROLES, YOUNG_STATUS, MISSION_STATUS } = require("snu-lib");
const router = express.Router();
const { YoungModel } = require("../../models");
const { MissionModel } = require("../../models");
const { MissionEquivalenceModel } = require("../../models");

const filtersJoi = Joi.object({
  status: Joi.array().items(Joi.string().valid(...Object.values(YOUNG_STATUS))),
  region: Joi.array().items(Joi.string()),
  academy: Joi.array().items(Joi.string()),
  department: Joi.array().items(Joi.string()),
  cohorts: Joi.array().items(Joi.string()),
  cohort: Joi.array().items(Joi.string()),
});

const missionFiltersJoi = Joi.object({
  start: Joi.date().allow(null),
  end: Joi.date().allow(null),
  sources: Joi.array().items(Joi.string()),
});

function computeYoungFilter(filters, user) {
  let matchs = {};
  if (filters && filters.status && filters.status.length > 0) {
    matchs.status = { $in: filters.status };
  }
  if (filters && filters.academies && filters.academies.length > 0) {
    matchs.academy = { $in: filters.academies };
  }
  if (filters && filters.cohort && filters.cohort.length > 0) {
    matchs.cohort = { $in: filters.cohort };
  }
  if (filters && filters.cohorts && filters.cohorts.length > 0) {
    matchs.cohort = { $in: filters.cohorts };
  }

  // Roles
  // Roles
  if (user.role === ROLES.REFERENT_REGION) {
    matchs.region = user.region;
  } else if (filters && filters.region && filters.region.length > 0) {
    matchs.region = { $in: filters.region };
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    matchs.department = { $in: filters.department.length ? filters.department.filter((d) => user.department.includes(d)) : user.department };
  } else if (filters && filters.department && filters.department.length > 0) {
    matchs.department = { $in: filters.department };
  }
  return matchs;
}

function computeMissionFilter(filters, user) {
  let matchs = {};

  if (filters && filters.start) {
    matchs.endAt = { $gte: filters.start };
  }
  if (filters && filters.end) {
    matchs.startAt = { $lt: filters.end };
  }
  if (filters && filters.sources && filters.sources.length > 0) {
    if (filters.sources.includes("JVA")) {
      if (filters.sources.includes("SNU")) {
        // il y a les 2 on ne fait rien de plus.
      } else {
        matchs.isJvaMission = "true";
      }
    } else if (filters.sources.includes("SNU")) {
      if (filters.sources.includes("JVA")) {
        // il y a les 2 on ne fait rien de plus.
      } else {
        matchs.isJvaMission = "false";
      }
    } else {
      // no filter
    }
  }

  // Roles
  if (user.role === ROLES.REFERENT_REGION) {
    matchs.region = user.region;
  } else if (filters && filters.region && filters.region.length > 0) {
    matchs.region = { $in: filters.region };
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    matchs.department = { $in: filters.department.length ? filters.department.filter((d) => user.department.includes(d)) : user.department };
  } else if (filters && filters.department && filters.department.length > 0) {
    matchs.department = { $in: filters.department };
  }

  return matchs;
}

router.post("/volontaires-equivalence-mig", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // TODO: refacto this part with middleware
    const allowedRoles = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters } = value;

    // --- get data
    // TODO: optimization
    const youngs = await YoungModel.find(
      { ...computeYoungFilter(filters, req.user), status_equivalence: { $exists: true } },
      { phase2ApplicationStatus: 1, statusPhase2Contract: 1 },
    );

    const youngIds = youngs.map((young) => young._id.toString());
    const missions = await MissionEquivalenceModel.find({ youngId: { $in: youngIds } });

    let total = 0;
    let statuses = {};
    let types = {};
    let subTypes = {};
    for (const mission of missions) {
      ++total;

      if (statuses[mission.status] === undefined) {
        statuses[mission.status] = 0;
      }
      ++statuses[mission.status];

      if (types[mission.type] === undefined) {
        types[mission.type] = {
          statuses: {
            [mission.status]: 0,
          },
          count: 0,
        };
      }
      if (types[mission.type].statuses[mission.status] === undefined) {
        types[mission.type].statuses[mission.status] = 0;
      }
      ++types[mission.type].count;
      ++types[mission.type].statuses[mission.status];

      if (mission.sousType) {
        if (subTypes[mission.sousType] === undefined) {
          subTypes[mission.sousType] = {
            statuses: {
              [mission.status]: 0,
            },
            type: mission.type,
            count: 0,
          };
        }
        if (subTypes[mission.sousType].statuses[mission.status] === undefined) {
          subTypes[mission.sousType].statuses[mission.status] = 0;
        }
        ++subTypes[mission.sousType].count;
        ++subTypes[mission.sousType].statuses[mission.status];
      }
    }

    const data = { statuses: [], types: [], subTypes: [] };
    for (const status of Object.keys(statuses)) {
      data.statuses.push({ status, value: statuses[status], percentage: total ? statuses[status] / total : 0 });
    }
    for (const subType of Object.keys(subTypes)) {
      data.subTypes.push({
        label: subType,
        value: subTypes[subType].count,
        percentage: total ? subTypes[subType].count / total : 0,
        type: subTypes[subType].type,
        statuses: subTypes[subType].statuses,
      });
    }
    for (const type of Object.keys(types)) {
      data.types.push({
        label: type,
        value: types[type].count,
        percentage: total ? types[type].count / total : 0,
        subTypes: data.subTypes.filter((subType) => subType.type === type),
        statuses: types[type].statuses,
      });
    }

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/missions-detail", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // TODO: refacto this part with middleware
    const allowedRoles = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
      sort: Joi.string().valid("validatedMission", "youngPreferences"),
      group: Joi.string().valid("domain", "period", "format"),
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, missionFilters, sort, group } = value;

    // get data
    // --- missions
    let missionPipeline = [{ $match: { ...computeMissionFilter({ ...missionFilters, ...filters }, req.user), status: MISSION_STATUS.VALIDATED } }];
    switch (group) {
      case "domain":
        missionPipeline.push({
          $group: {
            _id: "$mainDomain",
            count: { $sum: 1 },
            placesTotal: { $sum: "$placesTotal" },
            placesLeft: { $sum: "$placesLeft" },
          },
        });
        break;
      case "period":
        missionPipeline.push({ $unwind: "$period" });
        missionPipeline.push({
          $group: {
            _id: "$period",
            count: { $sum: 1 },
            placesTotal: { $sum: "$placesTotal" },
            placesLeft: { $sum: "$placesLeft" },
          },
        });
        break;
      case "format":
        missionPipeline.push({
          $group: {
            _id: "$format",
            count: { $sum: 1 },
            placesTotal: { $sum: "$placesTotal" },
            placesLeft: { $sum: "$placesLeft" },
          },
        });
        break;
    }
    const missionData = await MissionModel.aggregate(missionPipeline);

    // --- youngs preference
    let youngPipeline = [{ $match: computeYoungFilter(filters, req.user) }];
    switch (group) {
      case "domain":
        youngPipeline.push({ $unwind: "$domains" });
        youngPipeline.push({
          $group: {
            _id: "$domains",
            count: { $sum: 1 },
          },
        });
        break;
      case "period":
        youngPipeline.push({
          $group: {
            _id: "$period",
            count: { $sum: 1 },
          },
        });
        break;
      case "format":
        youngPipeline.push({
          $group: {
            _id: "$missionFormat",
            count: { $sum: 1 },
          },
        });
        break;
    }
    const youngData = await YoungModel.aggregate(youngPipeline);

    // --- format data
    const youngTotal = youngData.reduce((acc, data) => acc + data.count, 0);
    const missionTotal = missionData.reduce((acc, data) => acc + data.count, 0);
    const keys = [...new Set([...youngData, ...missionData].map((data) => data._id))];
    let data = [];
    for (const key of keys) {
      if (key !== null && key !== undefined && key.length > 0) {
        const young = youngData.find((d) => d._id === key);
        const mission = missionData.find((d) => d._id === key);
        data.push({
          key,
          youngPreferences: young && youngTotal ? young.count / youngTotal : 0,
          preferencesCount: young ? young.count : 0,
          validatedMission: mission && missionTotal ? mission.count / missionTotal : 0,
          missionsCount: mission ? mission.count : 0,
          placesLeft: mission && mission.placesTotal ? mission.placesLeft / mission.placesTotal : 0,
        });
      }
    }

    // --- sort
    data.sort((a, b) => {
      return b[sort] - a[sort];
    });

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/missions-young-preferences", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // TODO: refacto this part with middleware
    const allowedRoles = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
      group: Joi.string().valid("project", "geography", "volunteer"),
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, group } = value;

    // get data
    const youngFilter = computeYoungFilter(filters, req.user);
    let pipeline = [{ $match: youngFilter }];
    switch (group) {
      case "project":
        pipeline.push({
          $group: {
            _id: "$professionnalProject",
            count: { $sum: 1 },
          },
        });
        break;
      case "geography":
        pipeline.push({
          $facet: {
            mobilityNear: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  mobilityNearSchool: {
                    $sum: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$mobilityNearSchool", "true"] },
                            then: 1,
                          },
                        ],
                        default: 0,
                      },
                    },
                  },
                  mobilityNearHome: {
                    $sum: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$mobilityNearHome", "true"] },
                            then: 1,
                          },
                        ],
                        default: 0,
                      },
                    },
                  },
                  mobilityNearRelative: {
                    $sum: {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$mobilityNearRelative", "true"] },
                            then: 1,
                          },
                        ],
                        default: 0,
                      },
                    },
                  },
                },
              },
            ],
            mobilityTransport: [
              { $unwind: "$mobilityTransport" },
              {
                $group: {
                  _id: "$mobilityTransport",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        });
        break;
      case "volunteer":
        pipeline.push({
          $group: {
            _id: null,
            total: { $sum: 1 },
            engaged: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$engaged", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        });
        break;
    }
    pipeline.push({ $sort: { count: -1 } });
    const result = await YoungModel.aggregate(pipeline);

    let uniformResult;
    if (group === "project") {
      const uniformPipeline = [
        { $match: { ...youngFilter, professionnalProject: "UNIFORM" } },
        {
          $group: {
            _id: "$professionnalProjectPrecision",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ];
      uniformResult = await YoungModel.aggregate(uniformPipeline);
    }

    // --- format data
    let data = [];

    switch (group) {
      case "project":
        data = [
          result
            .filter((d) => d._id !== null)
            .map((d) => {
              if (d._id === "UNIFORM") {
                return { ...d, extra: uniformResult };
              } else {
                return d;
              }
            }),
        ];
        break;
      case "geography":
        data = [
          [
            { _id: "mobilityNearHome", count: result[0].mobilityNear[0].mobilityNearHome },
            { _id: "mobilityNearSchool", count: result[0].mobilityNear[0].mobilityNearSchool },
            { _id: "mobilityNearRelative", count: result[0].mobilityNear[0].mobilityNearRelative },
          ],
          result[0].mobilityTransport,
        ];
        break;
      case "volunteer":
        data = [
          [
            { _id: "true", count: result[0].engaged },
            { _id: "false", count: result[0].total - result[0].engaged },
          ],
        ];
        break;
    }

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
