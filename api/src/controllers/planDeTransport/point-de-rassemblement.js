const express = require("express");
const router = express.Router();
const passport = require("passport");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const YoungModel = require("../../models/young");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const { canViewMeetingPoints, canUpdateMeetingPoint, canCreateMeetingPoint, canDeleteMeetingPoint, canDeleteMeetingPointSession } = require("snu-lib/roles");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { validateId } = require("../../utils/validator");
const nanoid = require("nanoid");
const { COHORTS } = require("snu-lib");

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

    // ! PlanDeTransport save here !

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

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    pointDeRassemblement.set({ name, address, city, zip, department, region, location });
    await pointDeRassemblement.save({ fromUser: req.user });

    // ! PlanDeTransport save here !

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

    // ! PlanDeTransport save here !

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

    // ! PlanDeTransport save here !

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

    // ! PlanDeTransport save here !

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
