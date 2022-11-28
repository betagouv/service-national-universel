/**
 * ROUTES:
 *  GET    /schema-de-repartition/:cohort                       => get National data
 *  GET    /schema-de-repartition/:region/:cohort               => get Regional data
 *  GET    /schema-de-repartition/:region/:department/:cohort   => get Department data
 *  POST   /schema-de-repartition                               => création d'un groupe du schéma de répartition
 *  DELETE /schema-de-repartition/:id                           => suppression d'un group de schéma de répartition
 *  GET    /schema-de-repartition/centers/:department/:cohort ?mainPlacesCount&filter
 *                                                              => récupération des centres à partit d'un département pour le choix des centres
 *  GET    /schema-de-repartition/pdr/:department/:cohort       => récupération des points de rassemblements d'un département
 *  POST   /schema-de-repartition/get-group-detail              => Population du détail d'un groupe (centre et points de rassemblement)
 */

const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const {
  canViewSchemaDeRepartition,
  YOUNG_STATUS,
  regionList,
  region2department,
  getDepartmentNumber,
  COHORTS,
  canCreateSchemaDeRepartition,
  canDeleteSchemaDeRepartition,
  canEditSchemaDeRepartition,
} = require("snu-lib");
const Joi = require("joi");
const sessionPhase1Model = require("../../models/sessionPhase1");
const youngModel = require("../../models/young");
const schemaRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");
const tableRepartitionModel = require("../../models/PlanDeTransport/tableDeRepartition");
const pointRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const cohesionCenterModel = require("../../models/cohesionCenter");

const schemaRepartitionBodySchema = Joi.object({
  cohort: Joi.string()
    .valid(...COHORTS)
    .required(),
  intradepartmental: Joi.string().valid("true", "false"),
  fromDepartment: Joi.string().trim().required(),
  fromRegion: Joi.string().trim().required(),
  toDepartment: Joi.string().allow(null),
  toRegion: Joi.string().allow(null),
  centerId: Joi.string().allow(null),
  centerName: Joi.string().allow(null),
  centerCity: Joi.string().allow(null),
  sessionId: Joi.string().allow(null),
  youngsVolume: Joi.number().greater(0),
  gatheringPlaces: Joi.array().items(Joi.string()),
});

// ------- get data

router.get("/centers/:department/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- parameters & vérification
    const { error: errorParams, value: valueParams } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { department, cohort } = valueParams;

    const { error: errorQuery, value: query } = Joi.object({
      intra: Joi.boolean().default(false),
      minPlacesCount: Joi.number().default(0),
      filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { minPlacesCount, filter, intra } = query;

    // get the destination departments from table de repartition
    let toDepartments;
    if (intra) {
      toDepartments = [department];
    } else {
      toDepartments = await getDepartmentsFromDepartment(cohort, department);
    }

    // search centers & sessions
    const pipeline = [
      {
        $match: { cohort },
      },
      {
        $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
      },
      {
        $lookup: {
          from: "cohesioncenters",
          localField: "centerId",
          foreignField: "_id",
          as: "center",
        },
      },
      { $unwind: "$center" },
      { $match: { "center.department": { $in: toDepartments } } },
    ];

    if (minPlacesCount > 0) {
      pipeline.push({ $match: { placesTotal: { $gte: minPlacesCount } } });
    }

    // --- pour l'instant on ne filtre le texte que dans le nom, la ville et le départment du centre.
    if (filter && filter.length > 0) {
      const regex = new RegExp(".*" + filter + ".*", "gi");
      pipeline.push({ $match: { $or: [{ "center.name": regex }, { "center.city": regex }, { "center.department": regex }] } });
    }

    // --- sort and limit.
    pipeline.push({ $sort: { "center.name": 1 } });

    // QUERY
    const sessionResult = await sessionPhase1Model.aggregate(pipeline).exec();

    // format result
    const data = sessionResult.map((session) => {
      return {
        ...session.center,
        placesTotal: session.placesTotal,
        placesLeft: session.placesLeft,
        sessionId: session._id,
      };
    });

    // --- résultat
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/pdr/:department/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- parameters & vérification
    const { error: errorParams, value: valueParams } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { department, cohort } = valueParams;

    // search gathering places
    const pipeline = [{ $match: { cohorts: cohort, department } }, { $sort: { name: 1 } }];
    const data = await pointRassemblementModel.aggregate(pipeline).exec();

    // --- résultat
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/get-group-detail", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- parameters & vérification
    const { error: errorBody, value: group } = schemaRepartitionBodySchema.validate(req.body, { stripUnknown: true });
    if (errorBody) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // get center detail
    let center = null;
    if (group.centerId) {
      center = await cohesionCenterModel.findById(group.centerId);
    }

    // get gathering places
    let gatheringPlaces = [];
    if (group.gatheringPlaces && group.gatheringPlaces.length > 0) {
      gatheringPlaces = await pointRassemblementModel.find({ _id: { $in: group.gatheringPlaces } });
    }

    // format result
    const data = { center, gatheringPlaces };

    // --- résultat
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/department-detail/:department/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- parameters & vérification
    const { error: errorParams, value: valueParams } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { department, cohort } = valueParams;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // get centers
    const pipeline = [
      {
        $match: { cohort },
      },
      {
        $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
      },
      {
        $lookup: {
          from: "cohesioncenters",
          localField: "centerId",
          foreignField: "_id",
          as: "center",
        },
      },
      { $unwind: "$center" },
      { $match: { "center.department": department } },
      {
        $lookup: {
          from: "schemaderepartitions",
          localField: "cohesionCenterId",
          foreignField: "centerId",
          as: "groups",
        },
      },
      { $sort: { "center.name": 1 } },
    ];
    const sessionResult = await sessionPhase1Model.aggregate(pipeline).exec();

    let globalPlacesTotal = 0;
    let globalAffectedYoungs = 0;

    const centers = sessionResult.map((session) => {
      globalPlacesTotal += session.placesTotal;

      let affectedYoungs = 0;

      const groups = session.groups.map((group) => {
        affectedYoungs += group.youngsVolume;

        return {
          youngsVolume: group.youngsVolume,
          department: group.fromDepartment,
          region: group.fromRegion,
        };
      });

      globalAffectedYoungs += affectedYoungs;

      return {
        _id: session.center._id,
        name: session.center.name,
        city: session.center.city,
        department: session.center.department,
        affectedYoungs,
        placesTotal: session.placesTotal,
        placesLeft: Math.max(0, session.placesTotal - affectedYoungs),
        groups,
      };
    });

    const data = {
      affectedYoungs: globalAffectedYoungs,
      placesLeft: Math.max(0, globalPlacesTotal - globalAffectedYoungs),
      placesTotal: globalPlacesTotal,
      centers,
    };

    // --- résultat
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// --- summaries

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort } = value;

    if (!canViewSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- get stats for each departments
    const departments = await getDepartmentCentersAndCapacities(cohort);

    // --- get table de repartition for each regions
    const regions = await getRegionTableDeRepartition(cohort);
    // console.log("TABLE REGIONS: ", regions);

    // --- get centers & capacity extra & intra for each regions
    const filledRegions = regions.map((r) => {
      const extra = computeCenterAndCapacity(departments, r.toDepartments);
      const intra = computeCenterAndCapacity(departments, r.fromDepartments);
      return {
        ...r,
        extraCapacity: extra.capacity,
        extraCenters: extra.centers,
        intraCapacity: intra.capacity,
        intraCenters: intra.centers,
      };
    });
    // console.log("FILLED REGIONS: ", filledRegions);

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        { $match: { cohort, status: YOUNG_STATUS.VALIDATED } },
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
    const rows = filledRegions.map((r) => {
      return {
        name: r.fromRegion,
        capacity: r.extraCapacity,
        centers: r.extraCenters,
        intraCapacity: r.intraCapacity,
        total: 0,
        intradepartmental: 0,
        ...youngSet[r.FromRegion],
        assigned: 0,
        intradepartmentalAssigned: 0,
        ...repartitionSet[r.FromRegion],
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

    // --- get stats for each departments
    const departments = await getDepartmentCentersAndCapacities(cohort);
    // console.log("DEPARTEMENTS: ", departments);

    // --- get table de repartition for each department
    const departmentsTable = await getDepartmentTableDeRepartition(cohort, region);
    // console.log("TABLE DEPARTMENTS: ", departmentsTable);

    // --- get to regions from region
    const toRegions = await getRegionsAndDepartmentsFromRegion(cohort, region);

    // --- get centers & capacity extra & intra for each department
    const filledDepartments = departmentsTable.map((r) => {
      const extra = computeCenterAndCapacity(departments, r.toDepartments);
      const intra = computeCenterAndCapacity(departments, [r.fromDepartment]);
      return {
        ...r,
        extraCapacity: extra.capacity,
        extraCenters: extra.centers,
        intraCapacity: intra.capacity,
        intraCenters: intra.centers,
      };
    });
    // console.log("FILLED DEPARTMENTS: ", filledDepartments);

    // --- get centers by to regions
    const toCenterResult = await sessionPhase1Model
      .aggregate([
        {
          $match: { cohort },
        },
        {
          $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
        },
        {
          $lookup: {
            from: "cohesioncenters",
            localField: "centerId",
            foreignField: "_id",
            as: "center",
          },
        },
        { $unwind: "$center" },

        { $match: { "center.region": { $in: toRegions.map((r) => r.name) } } },
        {
          $group: {
            _id: "$center.region",
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
    // console.log("CENTER SET: ", toCenterSet);

    // --- volontaires
    const youngResult = await youngModel
      .aggregate([
        { $match: { cohort, region, status: YOUNG_STATUS.VALIDATED } },
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
          name: region.name,
          centers: 0,
          capacity: 0,
          ...toCenterSet[region.name],
        };
      }),
      rows: filledDepartments.map((r) => {
        return {
          name: r.fromDepartment,
          capacity: r.extraCapacity,
          centers: r.extraCenters,
          intraCapacity: r.intraCapacity,
          total: 0,
          intradepartmental: 0,
          ...youngSet[r.FromDepartment],
          assigned: 0,
          intradepartmentalAssigned: 0,
          ...repartitionSet[r.FromDepartment],
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
    const toCenterResult = await sessionPhase1Model
      .aggregate([
        {
          $match: { cohort },
        },
        {
          $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
        },
        {
          $lookup: {
            from: "cohesioncenters",
            localField: "centerId",
            foreignField: "_id",
            as: "center",
          },
        },
        { $unwind: "$center" },
        { $match: { "center.departmentCode": { $in: toDepartmentCodes } } },
        {
          $group: {
            _id: "$center.region",
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
    const schemas = await schemaRepartitionModel.find({ cohort, fromDepartment: department });
    let groups = {
      intra: [],
      extra: [],
    };
    let assigned = 0;
    let intradepartmentalAssigned = 0;
    for (const schema of schemas) {
      if (schema.intradepartmental === "true") {
        intradepartmentalAssigned++;
        groups.intra.push(schema);
      } else {
        groups.extra.push(schema);
      }
      assigned++;
    }

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
          assigned,
          intradepartmentalAssigned,
        },
      ],
      groups,
    };

    // console.log("DATA: ", data);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ------- CRUD

router.post("", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- vérification
    const bodySchema = Joi.object({
      cohort: Joi.string()
        .valid(...COHORTS)
        .required(),
      intradepartmental: Joi.string().valid("true", "false"),
      fromDepartment: Joi.string().trim().required(),
      fromRegion: Joi.string().trim().required(),
      toDepartment: Joi.string().trim().valid(null),
      toRegion: Joi.string().trim().valid(null),
      centerId: Joi.string().trim().valid(null),
      centerName: Joi.string().trim().valid(null),
      centerCity: Joi.string().trim().valid(null),
      sessionId: Joi.string().trim().valid(null),
      youngsVolume: Joi.number().greater(0),
      gatheringPlaces: Joi.array().items(Joi.string()),
    });
    const { error, value } = bodySchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canCreateSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- création
    const data = await schemaRepartitionModel.create(value);

    // --- résultat
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- vérification
    const { error, value } = Joi.object({ id: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id } = value;

    if (!canDeleteSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- delete schema
    const schema = await schemaRepartitionModel.findById(id);
    if (!schema) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await schemaRepartitionModel.deleteOne({ _id: schema._id });

    // --- résultat
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- vérification
    const { error: errorParams, value: valueParams } = Joi.object({ id: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id } = valueParams;

    const { error: errorBody, value } = schemaRepartitionBodySchema.validate(req.body, { stripUnknown: true });
    if (errorBody) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canEditSchemaDeRepartition(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update
    const schema = await schemaRepartitionModel.findById(id);
    if (!schema) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (value.centerId && typeof value.centerId === "string") {
      value.centerId = mongoose.Types.ObjectId(value.centerId);
    }
    if (value.gatheringPlaces) {
      value.gatheringPlaces = value.gatheringPlaces.map((gp) => {
        return typeof gp === "string" ? mongoose.Types.ObjectId(gp) : gp;
      });
    }

    schema.set(value);
    await schema.save();

    // --- résultat
    return res.status(200).send({ ok: true, data: schema });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

// ----------------------------------------
// fonctions utilitaires

/**
 * Cette fonction :
 * - prend toutes les sessions liées à une cohorte
 * - popule le centre lié à la session
 * - groupe les sessions par département pour récupérer la capacité et le nombre de centre.
 *
 * @param cohort
 * @returns {Promise<any>}
 */
async function getDepartmentCentersAndCapacities(cohort) {
  return await sessionPhase1Model
    .aggregate([
      {
        $match: { cohort },
      },
      {
        $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
      },
      {
        $lookup: {
          from: "cohesioncenters",
          localField: "centerId",
          foreignField: "_id",
          as: "center",
        },
      },
      { $unwind: "$center" },
      {
        $group: {
          _id: "$center.department",
          department: { $first: "$center.department" },
          centers: { $sum: 1 },
          capacity: { $sum: "$placesTotal" },
          remainingCapacity: { $sum: "$placesLeft" },
          departmentCode: { $first: "$center.departmentCode" },
          region: { $first: "$center.region" },
        },
      },
    ])
    .exec();
}

async function getRegionsAndDepartmentsFromRegion(cohort, region) {
  const regionsResult = await tableRepartitionModel.find({ fromRegion: region });
  const toRegionsSet = {};
  for (const repart of regionsResult) {
    if (toRegionsSet[repart.toRegion] === undefined) {
      toRegionsSet[repart.toRegion] = { name: repart.toRegion, departments: [] };
    }
    if (repart.toDepartment) {
      toRegionsSet[repart.toRegion].departments.push(repart.toDepartment);
    }
  }
  return Object.values(toRegionsSet);
}

async function getRegionTableDeRepartition(cohort) {
  const repartitions = await tableRepartitionModel.find({ cohort });
  let regions = {};
  for (const repartition of repartitions) {
    if (regions[repartition.fromRegion] === undefined) {
      regions[repartition.fromRegion] = { regions: {}, departments: {} };
    }
    regions[repartition.fromRegion].regions[repartition.toRegion] = true;

    let toDepartments = repartition.toDepartment ? [repartition.toDepartment] : region2department[repartition.toRegion];
    for (const dep of toDepartments) {
      regions[repartition.fromRegion].departments[dep] = true;
    }
  }

  return regionList.map((region) => {
    const regionData = regions[region];
    if (regionData) {
      return {
        fromRegion: region,
        fromDepartments: region2department[region],
        toRegions: Object.keys(regionData.regions),
        toDepartments: Object.keys(regionData.departments),
      };
    } else {
      return {
        fromRegion: region,
        fromDepartments: region2department[region],
        toRegions: [],
        toDepartments: [],
      };
    }
  });
}

async function getDepartmentTableDeRepartition(cohort, region) {
  const repartitions = await tableRepartitionModel.find({ cohort, fromRegion: region });
  let departments = {};
  for (const repartition of repartitions) {
    if (departments[repartition.fromDepartment] === undefined) {
      departments[repartition.fromDepartment] = { regions: {}, departments: {} };
    }
    departments[repartition.fromDepartment].regions[repartition.toRegion] = true;

    let toDepartments = repartition.toDepartment ? [repartition.toDepartment] : region2department[repartition.toRegion];
    for (const dep of toDepartments) {
      departments[repartition.fromDepartment].departments[dep] = true;
    }
  }

  return region2department[region].map((department) => {
    const depData = departments[department];
    if (depData) {
      return {
        fromRegion: region,
        fromDepartment: department,
        toRegions: Object.keys(depData.regions),
        toDepartments: Object.keys(depData.departments),
      };
    } else {
      return {
        fromRegion: region,
        fromDepartment: department,
        toRegions: [],
        toDepartments: [],
      };
    }
  });
}

async function getDepartmentsFromDepartment(cohort, department) {
  const repartitions = await tableRepartitionModel.find({ cohort, fromDepartment: department });
  let departments = {};
  for (const repartition of repartitions) {
    if (repartition.toDepartment) {
      departments[repartition.toDepartment] = true;
    }
  }

  return Object.keys(departments);
}

function computeCenterAndCapacity(departmentsData, forDepartments) {
  let capacity = 0;
  let centers = 0;
  for (const dep of departmentsData) {
    if (forDepartments.includes(dep.department)) {
      capacity += dep.capacity;
      centers += dep.centers;
    }
  }

  return { capacity, centers };
}
