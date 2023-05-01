const express = require("express");
const router = express.Router();
const passport = require("passport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
// const ModificationBusModel = require("../../models/PlanDeTransport/modificationBus");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const cohesionCenterModel = require("../../models/cohesionCenter");
const schemaRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");
const {
  canViewLigneBus,
  canCreateLigneBus,
  canEditLigneBusGeneralInfo,
  canEditLigneBusCenter,
  canEditLigneBusPointDeRassemblement,
  ROLES,
  canViewPatchesHistory,
} = require("snu-lib/roles");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { formatStringLongDate, isIsoDate, translateBusPatchesField } = require("snu-lib");
const mongoose = require("mongoose");

/**
 * Récupère toutes les ligneBus +  les points de rassemblemnts associés
 */
router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const ligneBus = await LigneBusModel.find({ deletedAt: { $exists: false } });
    let arrayMeetingPoints = [];
    ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds)));
    const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints } });
    const ligneToPoints = await LigneToPointModel.find({ lineId: { $in: ligneBus.map((l) => l._id) } });
    return res.status(200).send({ ok: true, data: { ligneBus, meetingPoints, ligneToPoints } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/info", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      busId: Joi.string().required(),
      departuredDate: Joi.date().required(),
      returnDate: Joi.date().required(),
      youngCapacity: Joi.number().required(),
      totalCapacity: Joi.number().required(),
      followerCapacity: Joi.number().required(),
      travelTime: Joi.string().required(),
      lunchBreak: Joi.boolean().required(),
      lunchBreakReturn: Joi.boolean().required(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canEditLigneBusGeneralInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { id, busId, departuredDate, returnDate, youngCapacity, totalCapacity, followerCapacity, travelTime, lunchBreak, lunchBreakReturn } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    youngCapacity = parseInt(youngCapacity);
    totalCapacity = parseInt(totalCapacity);
    followerCapacity = parseInt(followerCapacity);

    if (totalCapacity < youngCapacity + followerCapacity) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    //add some checks

    ligne.set({
      busId,
      departuredDate,
      returnDate,
      youngCapacity,
      totalCapacity,
      followerCapacity,
      travelTime,
      lunchBreak,
      lunchBreakReturn,
    });

    await ligne.save({ fromUser: req.user });

    // * Update slave PlanTransport
    // ! Gerer logique si il y a deja des inscrits
    const planDeTransport = await PlanTransportModel.findById(id);
    planDeTransport.set({
      busId,
      departureString: departuredDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      returnString: returnDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      lineFillingRate: youngCapacity && Math.floor((planDeTransport.youngSeatsTaken / youngCapacity) * 100),
      youngCapacity,
      totalCapacity,
      followerCapacity,
      travelTime,
      lunchBreak,
      lunchBreakReturn,
    });
    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    const infoBus = await getInfoBus(ligne);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/centre", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      centerArrivalTime: Joi.string().required(),
      centerDepartureTime: Joi.string().required(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canEditLigneBusCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { id, centerArrivalTime, centerDepartureTime } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //add some checks

    ligne.set({
      centerArrivalTime,
      centerDepartureTime,
    });

    await ligne.save({ fromUser: req.user });

    const infoBus = await getInfoBus(ligne);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/pointDeRassemblement", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      transportType: Joi.string().required(),
      meetingHour: Joi.string().required(),
      busArrivalHour: Joi.string().required(),
      departureHour: Joi.string().required(),
      returnHour: Joi.string().required(),
      meetingPointId: Joi.string().required(),
      newMeetingPointId: Joi.string().required(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canEditLigneBusPointDeRassemblement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { id, transportType, meetingHour, busArrivalHour, departureHour, returnHour, meetingPointId, newMeetingPointId } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const ligneToPoint = await LigneToPointModel.findOne({ lineId: id, meetingPointId });
    if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if ([ROLES.ADMIN, ROLES.TRANSPORTER].includes(req.user.role)) {
      ligneToPoint.set({
        transportType,
        meetingHour,
        busArrivalHour,
        departureHour,
        returnHour,
        ...(meetingPointId !== newMeetingPointId && { meetingPointId: newMeetingPointId }),
      });

      await ligneToPoint.save({ fromUser: req.user });

      if (meetingPointId !== newMeetingPointId) {
        const meetingPointsIds = ligne.meetingPointsIds.filter((id) => id !== meetingPointId);
        meetingPointsIds.push(newMeetingPointId);
        ligne.set({ meetingPointsIds });
        await ligne.save({ fromUser: req.user });
      }
    } else {
      ligneToPoint.set({
        transportType,
        meetingHour,
      });
      await ligneToPoint.save({ fromUser: req.user });
    }

    // * Update slave PlanTransport
    const planDeTransport = await PlanTransportModel.findById(id);
    const pointDeRassemblement = await PointDeRassemblementModel.findById(ObjectId(newMeetingPointId));
    const meetingPoint = planDeTransport.pointDeRassemblements.find((meetingPoint) => {
      return meetingPoint.meetingPointId === meetingPointId;
    });
    meetingPoint.set({
      meetingPointId: newMeetingPointId,
      ...pointDeRassemblement._doc,
      busArrivalHour: ligneToPoint.busArrivalHour,
      meetingHour: ligneToPoint.meetingHour,
      departureHour: ligneToPoint.departureHour,
      returnHour: ligneToPoint.returnHour,
      transportType: ligneToPoint.transportType,
    });

    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    const infoBus = await getInfoBus(ligne);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const infoBus = await getInfoBus(ligneBus);
    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/availablePDR", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const listGroup = await schemaRepartitionModel.find({ centerId: ligneBus.centerId });

    let idPDR = [];
    for (let group of listGroup) {
      for (let pdr of group.gatheringPlaces) {
        if (!idPDR.includes(pdr)) {
          idPDR.push(pdr);
        }
      }
    }

    const PDR = await PointDeRassemblementModel.find({ _id: { $in: idPDR } });

    return res.status(200).send({ ok: true, data: PDR });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/data-for-check", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //Get all youngs for this ligne and by meeting point
    const queryYoung = [
      { $match: { _id: ligneBus._id } },
      { $unwind: "$meetingPointsIds" },
      {
        $lookup: {
          from: "youngs",
          let: { meetingPoint: "$meetingPointsIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cohort", ligneBus.cohort] },
                    { $eq: ["$status", "VALIDATED"] },
                    { $eq: ["$sessionPhase1Id", ligneBus.sessionId] },
                    { $eq: ["$meetingPointId", "$$meetingPoint"] },
                  ],
                },
              },
            },
          ],
          as: "youngs",
        },
      },
      {
        $lookup: {
          from: "youngs",
          let: { id: ligneBus._id.toString() },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$ligneId", "$$id"] }, { $eq: ["$status", "VALIDATED"] }],
                },
              },
            },
          ],
          as: "youngsBus",
        },
      },
      {
        $project: { meetingPointsIds: 1, youngsCount: { $size: "$youngs" }, youngsBusCount: { $size: "$youngsBus" } },
      },
    ];

    const dataYoung = await LigneBusModel.aggregate(queryYoung).exec();

    let result = {
      meetingPoints: [],
    };
    let youngsCountBus = 0;
    for (let data of dataYoung) {
      result.meetingPoints.push({ youngsCount: data.youngsCount, meetingPointId: data.meetingPointsIds });
      youngsCountBus = data.youngsBusCount;
    }
    result.youngsCountBus = youngsCountBus;

    //Get young volume need for the destination center in schema
    const dataSchema = await schemaRepartitionModel.find({ sessionId: ligneBus.sessionId, intradepartmental: "false" });

    let schemaVolume = 0;
    for (let data of dataSchema) {
      schemaVolume += data.youngsVolume;
    }

    result.schemaVolume = schemaVolume;

    //Get young volume need for the destination center in bus
    const dataBus = await LigneBusModel.find({ sessionId: ligneBus.sessionId, _id: { $ne: ligneBus._id } });

    let busVolume = 0;
    for (let data of dataBus) {
      busVolume += data.youngCapacity;
    }

    result.busVolume = busVolume;

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/cohort/:cohort/hasValue", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate({ ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { cohort } = value;

    const ligne = await LigneBusModel.findOne({ cohort });

    return res.status(200).send({ ok: true, data: !!ligne });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function getInfoBus(line) {
  const ligneToBus = await LigneToPointModel.find({ lineId: line._id });

  let meetingsPointsDetail = [];
  for (let line of ligneToBus) {
    const pointDeRassemblement = await PointDeRassemblementModel.findById(line.meetingPointId);
    meetingsPointsDetail.push({ ...line._doc, ...pointDeRassemblement._doc });
  }

  const centerDetail = await cohesionCenterModel.findById(line.centerId);

  return { ...line._doc, meetingsPointsDetail, centerDetail };
}

const PATCHES_COUNT_PER_PAGE = 20;
const HIDDEN_FIELDS = ["/missionsInMail", "/historic", "/uploadedAt", "/sessionPhase1Id", "/correctedAt", "/lastStatusAt", "/token", "/Token"];
const IGNORED_VALUES = [null, undefined, "", "Vide", "[]", false];

/**
 * Pour l'historique du plan de transport, permet de récupérer la liste des options des filtres
 */
router.get("/patches/filter-options", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const busline = {
      op: await db.collection("lignebus_patches").distinct("ops.op"),
      path: await db.collection("lignebus_patches").distinct("ops.path"),
      user: await db.collection("lignebus_patches").distinct("user"),
    };
    const lineToPoint = {
      op: await db.collection("lignetopoint_patches").distinct("ops.op"),
      path: await db.collection("lignetopoint_patches").distinct("ops.path"),
      user: await db.collection("lignetopoint_patches").distinct("user"),
    };
    // const modifications = {
    //   op: await db.collection("modificationbus_patches").distinct("ops.op"),
    //   path: await db.collection("modificationbus_patches").distinct("ops.path"),
    //   user: await db.collection("modificationbus_patches").distinct("user"),
    // };

    const op = mergeArrayItems([...busline.op, ...lineToPoint.op /*, ...modifications.op*/]);
    const path = mergeArrayItems([...busline.path, ...lineToPoint.path /*, ...modifications.path*/]);
    const user = mergeArrayItems([...busline.user, ...lineToPoint.user /*, ...modifications.user*/], "_id");

    return res.status(200).send({
      ok: true,
      data: { op, path, user },
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Historique des plan de transports
 * (on cherche l'historique dans 3 patches (lignebus, modificationBus et ligneToPoint)
 */
router.get("/patches/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate data
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate(req.params);
    if (error) {
      console.log("🚀 ~ file: ligne-de-bus.js:551 ~ router.get ~ error", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: errorQuery, value: valueQuery } = Joi.object({
      offset: Joi.number(),
      limit: Joi.number().default(PATCHES_COUNT_PER_PAGE),
      page: Joi.number(),
      op: Joi.string(),
      path: Joi.string(),
      userId: Joi.string(),
      query: Joi.string().trim().lowercase(),
      nopagination: Joi.string(),
      // filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    let { offset, limit, page, op: filterOp, path: filterPath, userId: filterUserId, query: filterQuery, nopagination } = valueQuery;
    if (filterQuery && filterQuery.trim().length === 0) {
      filterQuery = undefined;
    }

    // --- security
    if (!canViewPatchesHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // --- query
    // ------ find all patches ids
    const { cohort } = value;
    const lines = await LigneBusModel.find({ cohort }, { _id: 1 });
    console.log("Count lines: ", lines.length);
    if (lines.length > 0) {
      const lineIds = lines.map((line) => line._id);
      const lineStringIds = lineIds.map((l) => l.toString());
      const lineToPoints = await LigneToPointModel.find({ lineId: { $in: lineStringIds } }, { _id: 1 });
      const lineToPointIds = lineToPoints.map((line) => line._id);
      // const modificationBuses = await ModificationBusModel.find({ lineId: { $in: lineStringIds } }, { _id: 1 });
      // const modificationBusIds = modificationBuses.map((line) => line._id);

      // ------ manage pagination
      if (offset === undefined || offset === null) {
        if (page === undefined || page === null || page < 1) {
          offset = 0;
        } else {
          offset = page * limit;
        }
      }

      // ------ compute filters
      let filter = {};
      let hasFilter = false;
      if (filterOp && filterOp.trim().length > 0) {
        filter.op = filterOp;
        hasFilter = true;
      }
      if (filterPath && filterPath.trim().length > 0) {
        filter.path = (filterPath.trim()[0] === "/" ? "" : "/") + filterPath.trim();
        hasFilter = true;
      }
      if (filterUserId && filterUserId.trim().length > 0) {
        try {
          filter["user._id"] = ObjectId(filterUserId);
          hasFilter = true;
        } catch (err) {
          // bad filterUserId... let us ignore this filter.
        }
      }
      const pipelineFilter = hasFilter ? [{ $match: filter }] : [];

      // ------ build complete pipeline
      const pipeline = [
        // tout ceci est là pour remplacer un $unionWith qui n'existe pas dans la version de mongo < 4.4
        { $limit: 1 },
        { $project: { _id: 1 } },
        { $project: { _id: 0 } },
        {
          $lookup: {
            from: "lignebus_patches",
            pipeline: [{ $match: { ref: { $in: lineIds } } }, { $addFields: { lineId: { $toObjectId: "$ref" } } }],
            as: "ligneBuses",
          },
        },
        {
          $lookup: {
            from: "lignetopoint_patches",
            pipeline: [
              { $match: { ref: { $in: lineToPointIds } } },
              { $addFields: { lineToPointId: { $toObjectId: "$ref" } } },
              {
                $lookup: {
                  from: "lignetopoints",
                  localField: "lineToPointId",
                  foreignField: "_id",
                  as: "lineToPoint",
                },
              },
              { $unwind: "$lineToPoint" },
              { $addFields: { lineId: { $toObjectId: "$lineToPoint.lineId" } } },
            ],
            as: "ligneToPoints",
          },
        },
        /*{
          $lookup: {
            from: "modificationbus_patches",
            pipeline: [
              { $match: { ref: { $in: modificationBusIds } } },
              { $addFields: { modificationId: { $toObjectId: "$ref" } } },
              {
                $lookup: {
                  from: "modificationbuses",
                  localField: "modificationId",
                  foreignField: "_id",
                  as: "modificationBus",
                },
              },
              { $unwind: "$modificationBus" },
              { $addFields: { lineId: { $toObjectId: "$modificationBus.lineId" } } },
            ],
            as: "modificationBuses",
          },
        },*/
        { $project: { union: { $concatArrays: ["$ligneBuses", "$ligneToPoints" /*, "$modificationBuses"*/] } } },
        { $unwind: "$union" },
        { $replaceRoot: { newRoot: "$union" } },
        {
          $lookup: {
            from: "lignebuses",
            localField: "lineId",
            foreignField: "_id",
            as: "bus",
          },
        },
        { $unwind: "$bus" },
        { $addFields: { refName: "$bus.busId" } },
        { $project: { bus: 0, lineToPoint: 0, lineToPointId: 0, modificationBus: 0, modificationId: 0 } },
        { $sort: { date: -1 } },

        // on déplie chaque op.
        { $unwind: "$ops" },
        {
          $addFields: {
            op: "$ops.op",
            path: "$ops.path",
            value: "$ops.value",
            originalValue: "$ops.originalValue",
          },
        },
        { $project: { ops: 0, __v: 0 } },

        // unwind on values array (fait anciennement en front)
        { $unwind: { path: "$value", preserveNullAndEmptyArrays: true } },

        // filter (fait anciennement en front)
        { $match: { path: { $nin: HIDDEN_FIELDS } } },
        { $match: { $or: [{ value: { $nin: IGNORED_VALUES } }, { originalValue: { $nin: IGNORED_VALUES } }] } },
        ...pipelineFilter,
      ];

      const patches = await LigneBusModel.aggregate(pipeline);
      // console.log(pipeline);
      // console.log("PATCHES: ", patches);

      // --- results
      if (patches && patches.length > 0) {
        let results;

        // --- filtrage texte libre
        if (filterQuery) {
          results = patches.filter((p) => {
            return filterPatchWithQuery(p, filterQuery);
          });
        } else {
          results = patches;
        }

        if (nopagination) {
          // --- result without pagination
          return res.status(200).send({
            ok: true,
            data: results,
            pagination: {
              count: results.length,
              pageCount: 1,
              page: 0,
              itemsPerPage: results.length,
            },
          });
        } else {
          // --- result with pagination
          return res.status(200).send({
            ok: true,
            data: results.slice(offset, offset + limit),
            pagination: {
              count: results.length,
              pageCount: Math.ceil(results.length / limit),
              page: Math.floor(offset / limit),
              itemsPerPage: limit,
            },
          });
        }
      } else {
        return res.status(200).send({
          ok: true,
          data: [],
          pagination: {
            count: 0,
            pageCount: 0,
            page: 0,
            itemsPerPage: limit,
          },
        });
      }
    } else {
      return res.status(200).send({ ok: true, data: [], pagination: { count: 0, pageCount: 0, page: 0 } });
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

function pathToKey(path) {
  if (path && path.length > 0) {
    let key = path[0] === "/" ? path.substring(1) : path;
    const idx = key.indexOf("/");
    if (idx >= 0) {
      key = key.substring(0, idx);
    }
    return key;
  } else {
    return path;
  }
}

function filterPatchWithQuery(p, query) {
  return (
    // bus
    p.refName.toLowerCase().includes(query) ||
    // field
    translateBusPatchesField(pathToKey(p.path)).toLowerCase().includes(query) ||
    // original-value
    (p.originalValue && (isIsoDate(p.originalValue) ? formatStringLongDate(p.originalValue) : p.originalValue.toString())?.toLowerCase().includes(query)) ||
    // value
    (p.value && (isIsoDate(p.value) ? formatStringLongDate(p.value) : p.value.toString())?.toLowerCase().includes(query))
  );
}

function mergeArrayItems(array, subProperty) {
  let set = {};
  for (const item of array) {
    if (subProperty) {
      if (item[subProperty]) {
        const p = pathToKey(item[subProperty].toString());
        if (p) {
          set[p] = item;
        }
      }
    } else {
      const p = pathToKey(item);
      if (p) {
        set[p] = p;
      }
    }
  }
  return Object.values(set);
}
