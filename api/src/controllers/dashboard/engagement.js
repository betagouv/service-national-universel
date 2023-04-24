const express = require("express");
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { YOUNG_STATUS } = require("snu-lib");
const router = express.Router();
const YoungModel = require("../../models/young");
const MissionModel = require("../../models/mission");
const MissionEquivalenceModel = require("../../models/missionEquivalence");
const StructureModel = require("../../models/structure");
const { MISSION_STATUS } = require("snu-lib/constants");

const filtersJoi = Joi.object({
  status: Joi.array().items(Joi.string().valid(...Object.values(YOUNG_STATUS))),
  region: Joi.array().items(Joi.string()),
  academy: Joi.array().items(Joi.string()),
  department: Joi.array().items(Joi.string()),
  cohorts: Joi.array().items(Joi.string()),
});

const missionFiltersJoi = Joi.object({
  start: Joi.date().allow(null),
  end: Joi.date().allow(null),
  sources: Joi.array().items(Joi.string()),
});

function computeYoungFilter(filters) {
  let matchs = {};
  if (filters && filters.status && filters.status.length > 0) {
    matchs.status = { $in: filters.status };
  }
  if (filters && filters.region && filters.region.length > 0) {
    matchs.region = { $in: filters.region };
  }
  if (filters && filters.department && filters.department.length > 0) {
    matchs.department = { $in: filters.department };
  }
  if (filters && filters.academies && filters.academies.length > 0) {
    matchs.academy = { $in: filters.academies };
  }
  if (filters && filters.cohort && filters.cohort.length > 0) {
    matchs.cohort = { $in: filters.cohort };
  }
  return matchs;
}

function computeStructureFilter(filters) {
  let matchs = {};
  if (filters && filters.region && filters.region.length > 0) {
    matchs.region = { $in: filters.region };
  }
  if (filters && filters.department && filters.department.length > 0) {
    matchs.department = { $in: filters.department };
  }
  return matchs;
}

function computeMissionFilter(filters) {
  let matchs = {};
  if (filters && filters.region && filters.region.length > 0) {
    matchs.region = { $in: filters.region };
  }
  if (filters && filters.department && filters.department.length > 0) {
    matchs.department = { $in: filters.department };
  }
  if (filters && filters.start) {
    matchs.endAt = { $gte: filters.start };
  }
  if (filters && filters.end) {
    matchs.startAt = { $lt: filters.end };
  }
  if (filters && filters.sources && filters.sources.length > 0) {
    matchs.structureId = { $in: filters.sources };
  }
  return matchs;
}

router.post("/volontaires-statuts-phase", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      phase: Joi.number().valid(1, 2, 3).required(),
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, phase } = value;

    // --- get data
    const pipeline = [
      { $match: computeYoungFilter(filters) },
      {
        $group: {
          _id: `$statusPhase${phase}`,
          count: { $sum: 1 },
        },
      },
    ];
    const data = await YoungModel.aggregate(pipeline);

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/volontaires-statuts-divers", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
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
    const youngs = await YoungModel.find(computeYoungFilter(filters), { phase2ApplicationStatus: 1, statusPhase2Contract: 1 });
    let phase2 = {};
    let totalPhase2 = 0;
    let contract = {};
    let totalContract = 0;
    for (const young of youngs) {
      // statuses
      for (const status of young.phase2ApplicationStatus) {
        if (phase2[status] === undefined) {
          phase2[status] = 0;
        }
        ++phase2[status];
        ++totalPhase2;
      }

      // contracts
      for (const status of young.statusPhase2Contract) {
        if (contract[status] === undefined) {
          contract[status] = 0;
        }
        ++contract[status];
        ++totalContract;
      }
    }

    // missions equivalences
    const youngIds = youngs.map((young) => young._id.toString());
    const equivalences = await MissionEquivalenceModel.aggregate([
      { $match: { youngId: { $in: youngIds } } },
      {
        $group: {
          _id: `$status`,
          count: { $sum: 1 },
        },
      },
    ]);

    // --- format data
    let data = [];
    for (const status of Object.keys(phase2)) {
      data.push({ category: "phase2", status, value: phase2[status], percentage: totalPhase2 ? phase2[status] / totalPhase2 : 0 });
    }
    for (const status of Object.keys(contract)) {
      data.push({ category: "contract", status, value: contract[status], percentage: totalContract ? contract[status] / totalContract : 0 });
    }
    const totalEquivalences = equivalences.reduce((acc, eq) => acc + eq.count, 0);
    for (const status of equivalences) {
      data.push({ category: "equivalence", status: status._id, value: status.count, percentage: totalEquivalences ? status.count / totalEquivalences : 0 });
    }

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/structures", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters } = value;

    // --- get data
    const pipeline = [
      { $match: computeYoungFilter(filters) },
      {
        $group: {
          _id: "$legalStatus",
          total: { $sum: 1 },
          national: {
            $sum: {
              $switch: {
                branches: [
                  {
                    case: { $and: [{ $ifNull: ["$networkName", false] }, { $ne: ["$networkName", ""] }] },
                    then: 1,
                  },
                ],
                default: 0,
              },
            },
          },
        },
      },
    ];
    let data = await StructureModel.aggregate(pipeline);

    // --- format data
    data = data.filter((structure) => structure._id != null);

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/mission-sources", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
    }).validate(req.body);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters } = value;

    // --- get data
    const sources = await StructureModel.find({ ...computeStructureFilter(filters) }, { _id: 1, name: 1 }, { sort: { name: 1 } });

    // --- format data
    const data = sources.filter((source) => source._id !== null);

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/mission-proposed-places", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
    }).validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, missionFilters } = value;

    // --- get data
    let pipeline = [
      { $match: { ...computeMissionFilter({ ...filters, ...missionFilters }), status: "VALIDATED" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$placesTotal" },
          left: { $sum: "$placesLeft" },
        },
      },
    ];
    let result = await MissionModel.aggregate(pipeline);

    console.log("result: ", result);

    let data;
    if (result.length > 0) {
      // --- format data
      data = {
        left: result[0].left,
        occupied: result[0].total - result[0].left,
        total: result[0].total,
      };
    } else {
      data = {
        left: 0,
        occupied: 0,
        total: 0,
      };
    }

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/missions-statuts", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
    }).validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, missionFilters } = value;

    // --- get data
    let pipeline = [
      { $match: { ...computeMissionFilter({ ...filters, ...missionFilters }) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$placesTotal" },
          left: { $sum: "$placesLeft" },
        },
      },
    ];
    let result = await MissionModel.aggregate(pipeline);

    const total = result.reduce((acc, eq) => acc + eq.count, 0);
    const data = result.map((status) => ({
      status: status._id,
      value: status.count,
      percentage: total ? status.count / total : 0,
      total: status.total,
      left: status.left,
    }));

    // --- result
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/missions-detail", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
      sort: Joi.string().valid("validatedMission", "youngPreferences"),
      group: Joi.string().valid("domain", "period", "format"),
    }).validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, missionFilters, sort, group } = value;

    // get data
    // --- missions
    let missionPipeline = [{ $match: { ...computeMissionFilter(filters, missionFilters), status: MISSION_STATUS.VALIDATED } }];
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
    let youngPipeline = [{ $match: computeYoungFilter(filters) }];
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
    // --- test body
    const { error, value } = Joi.object({
      filters: filtersJoi,
      missionFilters: missionFiltersJoi,
      group: Joi.string().valid("project", "geography", "volunteer"),
    }).validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { filters, group } = value;

    // get data
    const youngFilter = computeYoungFilter(filters);
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
    // console.log("Young Pref RESULT: ", result);

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
