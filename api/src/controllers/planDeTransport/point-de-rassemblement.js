const express = require("express");
const router = express.Router();
const passport = require("passport");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const SchemaDeRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const YoungModel = require("../../models/young");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const { canViewMeetingPoints, canUpdateMeetingPoint, canCreateMeetingPoint, canDeleteMeetingPoint, canDeleteMeetingPointSession } = require("snu-lib/roles");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { validateId } = require("../../utils/validator");
const nanoid = require("nanoid");
const { COHORTS } = require("snu-lib");
const { getCohesionCenterFromSession } = require("./commons");

/**
 * Récupère les points de rassemblements (avec horaire de passage) pour un jeune affecté.
 */
router.get("/available", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    // verify cohesion center
    let cohesionCenter = req.user.sessionPhase1Id ? await getCohesionCenterFromSession(req.user.sessionPhase1Id) : null;
    if (!cohesionCenter) {
      return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // get all meeting points to cohesion from schema de répartition center with bus
    const schemaMeetingPoints = await SchemaDeRepartitionModel.aggregate([
      { $match: { cohort: req.user.cohort, centerId: cohesionCenter._id.toString() } },
      { $unwind: "$gatheringPlaces" },
      {
        $addFields: { meetingPointId: { $toObjectId: "$gatheringPlaces" } },
      },
      {
        $lookup: {
          from: "pointderassemblements",
          localField: "meetingPointId",
          foreignField: "_id",
          as: "meetingPoint",
        },
      },
      { $unwind: "$meetingPoint" },
      {
        $replaceRoot: { newRoot: "$meetingPoint" },
      },
    ]);

    // get all buses to cohesion center using previous meeting points, find used meeting points with hours and get a new meeting point list
    const schemaMeetingPointIds = schemaMeetingPoints.map((m) => m._id.toString());
    const meetingPoints = await LigneToPointModel.aggregate([
      { $match: { meetingPointId: { $in: schemaMeetingPointIds } } },
      {
        $addFields: { lineId: { $toObjectId: "$lineId" } },
      },
      {
        $lookup: {
          from: "lignebuses",
          localField: "lineId",
          foreignField: "_id",
          as: "lignebus",
        },
      },
      { $unwind: "$lignebus" },
      { $match: { "lignebus.cohort": req.user.cohort, "lignebus.centerId": cohesionCenter._id.toString() } },
      {
        $addFields: { meetingPointId: { $toObjectId: "$meetingPointId" } },
      },
      {
        $lookup: {
          from: "pointderassemblements",
          localField: "meetingPointId",
          foreignField: "_id",
          as: "pdr",
        },
      },
      { $unwind: "$pdr" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$pdr",
              {
                meetingHour: "$meetingHour",
                returnHour: "$returnHour",
                busLineId: "$lignebus._id",
                youngSeatsTaken: "$lignebus.youngSeatsTaken",
                youngCapacity: "$lignebus.youngCapacity",
              },
            ],
          },
        },
      },
    ]);

    // on ne garde que les bus avec de la place restante.
    const availableMeetingPoints = meetingPoints.filter((mp) => {
      return mp.youngSeatsTaken < mp.youngCapacity;
    });

    // return meeting points
    return res.status(200).send({ ok: true, data: availableMeetingPoints });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Récupère les points de rassemblements pour un centre de cohésion avec cohort
 */
router.get("/center/:centerId/cohort/:cohortId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      centerId: Joi.string().required(),
      cohortId: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { centerId, cohortId } = value;

    if (!canViewMeetingPoints(req.user, { centerId, cohortId })) {
      return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const ligneBus = await LigneBusModel.find({ cohort: cohortId, centerId: centerId });

    let arrayMeetingPoints = [];
    ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds)));

    const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints } });

    return res.status(200).send({ ok: true, data: { meetingPoints, ligneBus } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      complementAddress: Joi.string().allow(null, ""),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      location: Joi.object({
        lat: Joi.number().required(),
        lon: Joi.number().required(),
      })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canCreateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.FORBIDDEN });

    const { cohort, name, address, complementAddress, city, zip, department, region, location } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.create({
      code: nanoid(),
      cohorts: [cohort],
      name,
      address,
      complementAddress: {
        complement: complementAddress,
        cohort: cohort,
      },
      city,
      zip,
      department,
      region,
      location,
    });

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      location: Joi.object({
        lat: Joi.number().required(),
        lon: Joi.number().required(),
      })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
    }).validate({ ...req.body, id: req.params.id });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canUpdateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id, name, address, city, zip, department, region, location } = value;

    // * Update slave PlanTransport
    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    pointDeRassemblement.set({ name, address, city, zip, department, region, location });
    await pointDeRassemblement.save({ fromUser: req.user });

    const planDeTransport = await PlanTransportModel.find({ "pointDeRassemblements.meetingPointId": id });

    for await (const p of planDeTransport) {
      const meetingPoint = p.pointDeRassemblements.find((meetingPoint) => {
        return meetingPoint.meetingPointId === id;
      });
      meetingPoint.set({ ...meetingPoint, name, address, city, zip, department, region, location });
      await p.save({ fromUser: req.user });
    }
    // * End update slave PlanTransport

    //si jeunes affecté à ce point de rassemblement et ce sejour --> notification

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/cohort/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      cohort: Joi.string().required(),
      complementAddress: Joi.string().allow(null, ""),
    }).validate({ ...req.body, id: req.params.id });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canUpdateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id, cohort, complementAddress } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let cohortsToUpdate = pointDeRassemblement.cohorts;
    if (!cohortsToUpdate.includes(cohort)) cohortsToUpdate.push(cohort);

    let complementAddressToUpdate = pointDeRassemblement.complementAddress;
    complementAddressToUpdate = complementAddressToUpdate.filter((c) => c.cohort !== cohort);
    complementAddressToUpdate.push({ cohort, complement: complementAddress });

    pointDeRassemblement.set({ cohorts: cohortsToUpdate, complementAddress: complementAddressToUpdate });
    await pointDeRassemblement.save({ fromUser: req.user });

    //si jeunes affecté à ce point de rassemblement et ce sejour --> notification

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/delete/cohort/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      cohort: Joi.string().required(),
    }).validate({ ...req.body, id: req.params.id });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canDeleteMeetingPointSession(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id, cohort } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const youngs = await YoungModel.find({ meetingPointId: id });
    if (youngs.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let cohortsToUpdate = pointDeRassemblement.cohorts.filter((c) => c !== cohort);
    let complementAddressToUpdate = pointDeRassemblement.complementAddress.filter((c) => c.cohort !== cohort);

    pointDeRassemblement.set({ cohorts: cohortsToUpdate, complementAddress: complementAddressToUpdate });
    await pointDeRassemblement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);

    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await PointDeRassemblementModel.findOne({ _id: checkedId, deletedAt: { $exists: false } });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// get 1 meetingPoint info with meetingPoint Id and Bus Id as params
router.get("/fullInfo/:pdrId/:busId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorParams, value: valueParams } = Joi.object({ pdrId: Joi.string().required(), busId: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { pdrId, busId } = valueParams;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(pdrId);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const bus = await LigneBusModel.findById(busId);
    if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const ligneToPoint = await LigneToPointModel.findOne({ meetingPointId: pdrId, lineId: busId });
    if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: { pointDeRassemblement, bus, ligneToPoint } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// get all available meetingPoints with cohort and centerId as params
router.get("/ligneToPoint/:cohort/:centerId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- parameters & vérification
    const { error: errorParams, value: valueParams } = Joi.object({ cohort: Joi.string().required(), centerId: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort, centerId } = valueParams;

    const { error: errorQuery, value: valueQuery } = Joi.object({
      filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { filter } = valueQuery;
    const regex = new RegExp(".*" + filter ? filter : "" + ".*", "gi");

    // get all meeting points to cohesion from schema de répartition center with bus
    const schemaMeetingPoints = await SchemaDeRepartitionModel.aggregate([
      { $match: { cohort: cohort, centerId: centerId } },
      { $unwind: "$gatheringPlaces" },
      {
        $addFields: { meetingPointId: { $toObjectId: "$gatheringPlaces" } },
      },
      {
        $lookup: {
          from: "pointderassemblements",
          localField: "meetingPointId",
          foreignField: "_id",
          as: "meetingPoint",
        },
      },
      { $unwind: "$meetingPoint" },
      {
        $replaceRoot: { newRoot: "$meetingPoint" },
      },
    ]);
    const schemaMeetingPointIds = schemaMeetingPoints.map((m) => m._id.toString());

    const ligneToPoint = await LigneToPointModel.find({ meetingPointId: { $in: schemaMeetingPointIds }, deletedAt: { $exists: false } });

    const ligneBusIds = ligneToPoint.map((l) => l.lineId.toString());
    let ligneBus = await LigneBusModel.find({ _id: { $in: ligneBusIds } });

    const finalMeettingPoints = [];
    ligneBus.map((l) => {
      l.meetingPointsIds.map((m) => {
        if (schemaMeetingPointIds.includes(m) && !finalMeettingPoints.includes(m)) finalMeettingPoints.push(m);
      });
    });

    const finalMeettingPointsObjects = await PointDeRassemblementModel.find({
      _id: { $in: finalMeettingPoints },
      $or: [{ name: { $regex: regex } }, { city: { $regex: regex } }, { department: { $regex: regex } }, { region: { $regex: regex } }],
    });

    //build final Array since client wait for ligneToPoint + meetingPoint + ligneBus
    const data = [];
    finalMeettingPointsObjects.map((m) => {
      const ligneToPointFiltered = ligneToPoint.find((l) => l.meetingPointId === m._id.toString());
      const ligneBusFiltered = ligneBus.find((l) => l._id.toString() === ligneToPointFiltered.lineId);

      // filter uniquement sur les bus avec des places dispos
      if (ligneBusFiltered && ligneBusFiltered.youngSeatsTaken < ligneBusFiltered.youngCapacity) {
        data.push({ meetingPoint: m, ligneToPoint: ligneToPointFiltered, ligneBus: ligneBusFiltered });
      }
    });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/bus/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorCohort, value: checkedCohort } = Joi.string()
      .required()
      .valid(...COHORTS)
      .validate(req.params.cohort);

    if (errorId || errorCohort) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await PointDeRassemblementModel.findOne({ _id: checkedId, deletedAt: { $exists: false } });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const lignes = await LigneBusModel.find({ cohort: checkedCohort, meetingPointsIds: checkedId });
    if (!lignes.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const meetingPointsDetail = await LigneToPointModel.find({ lineId: { $in: lignes.map((l) => l._id) }, meetingPointId: checkedId });

    return res.status(200).send({ ok: true, data: { bus: lignes, meetingPoint: data, meetingPointsDetail } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canDeleteMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const pointDeRassemblement = await PointDeRassemblementModel.findById(checkedId);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const youngs = await YoungModel.find({ meetingPointId: checkedId });
    if (youngs.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const now = new Date();
    pointDeRassemblement.set({ deletedAt: now });
    await pointDeRassemblement.save({ fromUser: req.user });

    // ! What we do here if the point de rassemblement is link to ligneToPoint ? lingneToBus ? planDeTransport ?

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
