const express = require("express");
const router = express.Router();
const passport = require("passport");
const config = require("config");
const { PointDeRassemblementModel } = require("../../models");
const { SchemaDeRepartitionModel } = require("../../models");
const { LigneBusModel } = require("../../models");
const { YoungModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { PlanTransportModel } = require("../../models");
const { CohortModel } = require("../../models");
const {
  getCohortNames,
  SENDINBLUE_TEMPLATES,
  canViewMeetingPoints,
  canUpdateMeetingPoint,
  canCreateMeetingPoint,
  canDeleteMeetingPoint,
  canDeleteMeetingPointSession,
  isPdrEditionOpen,
} = require("snu-lib");
const { ERRORS, isYoung } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { validateId } = require("../../utils/validator");
const nanoid = require("nanoid");
const { getCohesionCenterFromSession } = require("./commons");
const { getTransporter } = require("../../utils");
const { sendTemplate } = require("../../brevo");

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

    // We need to get all the meetingPoints that:
    // - are in a young's department
    // - are in a bus line that is affected to the young's session
    // - are in a bus line that still has available seats

    const meetingPointsInSameDepartment = await PointDeRassemblementModel.find({ department: req.user.department });

    // get all buses to cohesion center using previous meeting points, find used meeting points with hours and get a new meeting point list
    let meetingPointIds = meetingPointsInSameDepartment.map((m) => m._id.toString());
    // on ajoute le PDR choisi par le jeune pour être certain qu'il soit à l'arrivée.
    if (req.user.meetingPointId) {
      meetingPointIds.push(req.user.meetingPointId);
    }
    const meetingPoints = await LigneToPointModel.aggregate([
      { $match: { meetingPointId: { $in: meetingPointIds } } },
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
                busLineName: "$lignebus.busId",
                youngSeatsTaken: "$lignebus.youngSeatsTaken",
                youngCapacity: "$lignebus.youngCapacity",
                departuredDate: "$lignebus.departuredDate",
                returnDate: "$lignebus.returnDate",
              },
            ],
          },
        },
      },
    ]);

    // on ne garde que les bus avec de la place restante.
    const availableMeetingPoints = meetingPoints.filter((mp) => {
      if (req.user.meetingPointId) {
        return mp.youngSeatsTaken < mp.youngCapacity || req.user.meetingPointId === mp._id.toString();
      } else {
        return mp.youngSeatsTaken < mp.youngCapacity;
      }
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
router.get("/center/:centerId/cohort/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      centerId: Joi.string().required(),
      cohort: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { centerId, cohort } = value;

    if (!canViewMeetingPoints(req.user, { centerId, cohort })) {
      return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const ligneBus = await LigneBusModel.find({ cohort: cohort, centerId: centerId });

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

    const { id, name, address, city, zip, department, region, location } = value;

    // * Update slave PlanTransport
    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canUpdateMeetingPoint(req.user, pointDeRassemblement)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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

    const IsSchemaDownloadIsTrue = await CohortModel.find({ name: pointDeRassemblement.cohorts, dateEnd: { $gt: new Date().getTime() } }, [
      "name",
      "repartitionSchemaDownloadAvailability",
      "dateStart",
    ]);

    if (IsSchemaDownloadIsTrue.filter((item) => item.repartitionSchemaDownloadAvailability === true).length) {
      const firstSession = IsSchemaDownloadIsTrue.filter((item) => item.repartitionSchemaDownloadAvailability === true).sort((a, b) => a.dateStart - b.dateStart);
      const referentTransport = await getTransporter();
      if (!referentTransport) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      let template = SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.MODIFICATION_SCHEMA;
      const mail = await sendTemplate(template, {
        emailTo: referentTransport.map((referent) => ({
          name: `${referent.firstName} ${referent.lastName}`,
          email: referent.email,
        })),
        params: {
          trigger: "pdr_changed",
          pdr_id: pointDeRassemblement.name,
          cta: `${config.ADMIN_URL}/schema-repartition?cohort=${firstSession[0].name}`,
        },
      });
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

    const { id, cohort, complementAddress } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canUpdateMeetingPoint(req.user, pointDeRassemblement)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const cohortData = await CohortModel.findOne({ name: cohort });
    if (!cohortData) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isPdrEditionOpen(req.user, cohortData)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let cohortsToUpdate = pointDeRassemblement.cohorts;
    if (!cohortsToUpdate.includes(cohort)) cohortsToUpdate.push(cohort);

    let complementAddressToUpdate = pointDeRassemblement.complementAddress;
    complementAddressToUpdate = complementAddressToUpdate.filter((c) => c.cohort !== cohort);
    complementAddressToUpdate.push({ cohort, complement: complementAddress });

    pointDeRassemblement.set({ cohorts: cohortsToUpdate, complementAddress: complementAddressToUpdate });
    await pointDeRassemblement.save({ fromUser: req.user });

    const IsSchemaDownloadIsTrue = await CohortModel.find({ name: pointDeRassemblement.cohorts }, ["name", "repartitionSchemaDownloadAvailability", "dateStart"]);

    if (IsSchemaDownloadIsTrue.filter((item) => item.repartitionSchemaDownloadAvailability === true).length) {
      const firstSession = IsSchemaDownloadIsTrue.filter((item) => item.repartitionSchemaDownloadAvailability === true).sort((a, b) => a.dateStart - b.dateStart);
      const referentTransport = await getTransporter();
      if (!referentTransport) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      let template = SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.MODIFICATION_SCHEMA;
      const mail = await sendTemplate(template, {
        emailTo: referentTransport.map((referent) => ({
          name: `${referent.firstName} ${referent.lastName}`,
          email: referent.email,
        })),
        params: {
          trigger: "pdr_changed",
          pdr_id: pointDeRassemblement.name,
          cta: `${config.ADMIN_URL}/schema-repartition?cohort=${firstSession[0].name}`,
        },
      });
    }

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

    const youngs = await YoungModel.find({ meetingPointId: id, cohort: cohort });
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
router.get("/fullInfo/:pdrId/:busId", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorParams, value: valueParams } = Joi.object({ pdrId: Joi.string().required(), busId: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { pdrId, busId } = valueParams;

    // young can only get his own meetingPoint info
    if (isYoung(req.user)) {
      const young = await YoungModel.findById(req.user._id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (young.meetingPointId !== pdrId || young.ligneId !== busId) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

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

    const ligneDeBus = await LigneBusModel.find({ cohort: cohort, centerId: centerId });
    const ligneToPoint = await LigneToPointModel.find({ lineId: { $in: ligneDeBus.map((l) => l._id) } });

    const meetingPointIds = ligneToPoint.map((l) => l.meetingPointId.toString());
    const meetingPoints = await PointDeRassemblementModel.find({
      _id: { $in: meetingPointIds },
      $or: [{ name: { $regex: regex } }, { city: { $regex: regex } }, { department: { $regex: regex } }, { region: { $regex: regex } }],
      deletedAt: { $exists: false },
    });

    //build final Array since client wait for ligneToPoint + meetingPoint + ligneBus
    const data = [];
    ligneToPoint.map((ligne) => {
      const meetingPointFiltered = meetingPoints.find((m) => m._id.toString() === ligne.meetingPointId);
      const ligneBusFiltered = ligneDeBus.find((l) => l._id.toString() === ligne.lineId);

      // filter uniquement sur les bus avec des places dispos
      if (meetingPointFiltered && ligneBusFiltered && ligneBusFiltered.youngSeatsTaken < ligneBusFiltered.youngCapacity)
        data.push({ meetingPoint: meetingPointFiltered, ligneToPoint: ligne, ligneBus: ligneBusFiltered });
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
      .valid(...getCohortNames())
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

//check if meetingPoint is in a schema
router.get("/:id/in-schema", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- vérification
    const { error: errorParams, value: valueParams } = Joi.object({ id: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id } = valueParams;

    if (!canViewMeetingPoints(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update
    const schema = await SchemaDeRepartitionModel.findOne({ gatheringPlaces: id });

    // --- résultat
    // noinspection RedundantConditionalExpressionJS
    return res.status(200).send({ ok: true, data: schema ? true : false });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
