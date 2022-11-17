/**
 * ROUTES:
 *  GET /schema-de-repartition/:cohort                      => get National data
 *  GET /schema-de-repartition/:region/:cohort              => get Regional data
 *  GET /schema-de-repartition/:region/:department/:cohort  => get Department data
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { canViewSchemaDeRepartition, YOUNG_STATUS, regionList, region2department, getDepartmentNumber } = require("snu-lib");
const Joi = require("joi");
const cohesionCenterModel = require("../../models/cohesionCenter");
const youngModel = require("../../models/young");
const schemaRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");
const tableRepartitionModel = require("../../models/PlanDeTransport/tableDeRepartition");

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort } = value;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- capacities & centers
    const centerResult = await cohesionCenterModel
      .aggregate([
        // TODO: pour l'instant j'ai viré la relation sur les cohorts car sinon on n'a aucune données.
        // {
        //   $match: { cohorts: cohort },
        // },
        {
          $group: {
            _id: "$region",
            centers: { $sum: 1 },
            capacity: { $sum: "$placesTotal" },
          },
        },
      ])
      .exec();
    let centerSet = {};
    for (const line of centerResult) {
      centerSet[line._id] = { centers: line.centers, capacity: line.capacity };
    }

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        // TODO: véfifier la liste des jeunes
        { $match: { cohort, status: { $in: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.IN_PROGRESS] } } },
        {
          $group: {
            _id: "$region",
            total: { $sum: 1 },
            intradepartmental: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$handicapInSameDepartment", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();

    let youngSet = {};
    for (const line of youngResult) {
      youngSet[line._id] = { total: line.total, intradepartmental: line.intradepartmental };
    }

    // --- assigned
    const repartitionResult = await schemaRepartitionModel
      .aggregate([
        { $match: { cohort } },
        {
          $group: {
            _id: "$fromRegion",
            assigned: { $sum: "$youngsVolume" },
            intradepartmentalAssigned: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$intradepartmental", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    let repartitionSet = {};
    for (const line of repartitionResult) {
      repartitionSet[line._id] = { assigned: line.assigned, intradepartmentalAsigned: line.intradepartmentalAsigned };
    }

    // --- Format result
    const rows = regionList.map((region) => {
      return {
        name: region,
        centers: 0,
        capacity: 0,
        ...centerSet[region],
        total: 0,
        intradepartmental: 0,
        ...youngSet[region],
        assigned: 0,
        intradepartmentalAssigned: 0,
        ...repartitionSet[region],
      };
    });

    return res.status(200).send({ ok: true, data: { rows } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:region/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required(), region: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort, region } = value;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- find to regions from region
    const regionsResult = await tableRepartitionModel.find({ fromRegion: region });
    const toRegionsSet = {};
    for (const repart of regionsResult) {
      toRegionsSet[repart.toRegion] = true;
    }
    const toRegions = Object.keys(toRegionsSet);

    // --- get departments from toRegions
    let fromDepartments = region2department[region];
    let fromDepartmentCodes = [];
    fromDepartments = fromDepartments.map((dep) => {
      const code = getDepartmentNumber(dep);
      fromDepartmentCodes.push(code);
      return {
        name: dep,
        code,
      };
    });

    // --- capacities & centers
    const fromCenterResult = await cohesionCenterModel
      .aggregate([
        // TODO: pour l'instant j'ai viré la relation sur les cohorts car sinon on n'a aucune données.
        // { $match: { cohorts: cohort, departmentCode: { $in: fromDepartmentCodes } } },
        { $match: { departmentCode: { $in: fromDepartmentCodes } } },
        {
          $group: {
            _id: "$department",
            centers: { $sum: 1 },
            capacity: { $sum: "$placesTotal" },
          },
        },
      ])
      .exec();
    let fromCenterSet = {};
    for (const line of fromCenterResult) {
      fromCenterSet[line._id] = { centers: line.centers, capacity: line.capacity };
    }

    const toCenterResult = await cohesionCenterModel
      .aggregate([
        // TODO: pour l'instant j'ai viré la relation sur les cohorts car sinon on n'a aucune données.
        // { $match: { cohorts: cohort, departmentCode: { $in: toDepartmentCodes } } },
        { $match: { region: { $in: toRegions } } },
        {
          $group: {
            _id: "$region",
            centers: { $sum: 1 },
            capacity: { $sum: "$placesTotal" },
          },
        },
      ])
      .exec();
    let toCenterSet = {};
    for (const line of toCenterResult) {
      toCenterSet[line._id] = { centers: line.centers, capacity: line.capacity };
    }

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        // TODO: véfifier la liste des jeunes
        { $match: { cohort, region, status: { $in: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.IN_PROGRESS] } } },
        {
          $group: {
            _id: "$department",
            total: { $sum: 1 },
            intradepartmental: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$handicapInSameDepartment", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    let youngSet = {};
    for (const line of youngResult) {
      youngSet[line._id] = { total: line.total, intradepartmental: line.intradepartmental };
    }

    // console.log("YOUNG RESULT: ", youngSet);

    // --- assigned
    const repartitionResult = await schemaRepartitionModel
      .aggregate([
        { $match: { cohort, fromRegion: region } },
        {
          $group: {
            _id: "$fromDepartment",
            assigned: { $sum: "$youngsVolume" },
            intradepartmentalAssigned: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$intradepartmental", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    let repartitionSet = {};
    for (const line of repartitionResult) {
      repartitionSet[line._id] = { assigned: line.assigned, intradepartmentalAsigned: line.intradepartmentalAsigned };
    }

    // --- Format result
    let data = {
      toCenters: toRegions.map((region) => {
        return {
          name: region,
          centers: 0,
          capacity: 0,
          ...toCenterSet[region],
        };
      }),
      rows: fromDepartments.map((dep) => {
        console.log(dep, " => ", youngSet[dep]);
        return {
          name: dep.name,
          code: dep.code,
          centers: 0,
          capacity: 0,
          ...fromCenterSet[dep.name],
          total: 0,
          intradepartmental: 0,
          ...youngSet[dep.name],
          assigned: 0,
          intradepartmentalAssigned: 0,
          ...repartitionSet[dep.name],
        };
      }),
    };

    // console.log("DATA: ", data);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:region/:department/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required(), region: Joi.string().required(), department: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort, region, department } = value;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- find to regions from region
    const regionsResult = await tableRepartitionModel.find({ fromRegion: region });
    const toRegionsSet = {};
    let toDepartmentCodes = [];
    for (const repart of regionsResult) {
      if (!toRegionsSet[repart.toRegion]) {
        toRegionsSet[repart.toRegion] = {
          name: repart.toRegion,
          departments: [],
        };
      }
      if (repart.toDepartment) {
        toDepartmentCodes.push(getDepartmentNumber(repart.toDepartment));
        toRegionsSet[repart.toRegion].departments.push(repart.toDepartment);
      }
    }
    const toRegions = Object.values(toRegionsSet);

    // --- capacities & centers
    const toCenterResult = await cohesionCenterModel
      .aggregate([
        // TODO: pour l'instant j'ai viré la relation sur les cohorts car sinon on n'a aucune données.
        // { $match: { cohorst: cohort, departmentCode: { $in: toDepartmentCodes } } },
        { $match: { departmentCode: { $in: toDepartmentCodes } } },
        {
          $group: {
            _id: "$region",
            centers: { $sum: 1 },
            capacity: { $sum: "$placesTotal" },
          },
        },
      ])
      .exec();
    let toCenterSet = {};
    for (const line of toCenterResult) {
      toCenterSet[line._id] = { centers: line.centers, capacity: line.capacity };
    }

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        // TODO: véfifier la liste des jeunes
        { $match: { cohort, department, status: { $in: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.IN_PROGRESS] } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            intradepartmental: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$handicapInSameDepartment", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    let youngValues = youngResult[0];

    // --- assigned
    const repartitionResult = await schemaRepartitionModel
      .aggregate([
        { $match: { cohort, fromDepartment: department } },
        {
          $group: {
            _id: null,
            assigned: { $sum: "$youngsVolume" },
            intradepartmentalAssigned: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$intradepartmental", "true"] },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        },
      ])
      .exec();
    const repartitionValues = repartitionResult[0];

    // --- Format result
    let data = {
      toCenters: toRegions.map((region) => {
        return {
          name: region.name,
          departments: region.departments,
          centers: 0,
          capacity: 0,
          ...toCenterSet[region.name],
        };
      }),
      rows: [
        {
          name: department,
          ...youngValues,
          ...repartitionValues,
        },
      ],
      // rows: fromDepartments.map((dep) => {
      //   console.log(dep, " => ", youngSet[dep]);
      //   return {
      //     name: dep.name,
      //     code: dep.code,
      //     centers: 0,
      //     capacity: 0,
      //     ...fromCenterSet[dep.name],
      //     total: 0,
      //     intradepartmental: 0,
      //     ...youngSet[dep.name],
      //     assigned: 0,
      //     intradepartmentalAssigned: 0,
      //     ...repartitionSet[dep.name],
      //   };
      // }),
    };

    // console.log("DATA: ", data);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
