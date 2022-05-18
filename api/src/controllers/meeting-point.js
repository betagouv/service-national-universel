const express = require("express");
const router = express.Router();
const passport = require("passport");
const { canViewMeetingPoints, canUpdateMeetingPoint } = require("snu-lib/roles");
const { capture } = require("../sentry");
const { validateId } = require("../utils/validator");
const MeetingPointModel = require("../models/meetingPoint");
const CohesionCenterModel = require("../models/cohesionCenter");
const BusModel = require("../models/bus");
const { ERRORS, isYoung, isReferent } = require("../utils");
const Joi = require("joi");

router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await MeetingPointModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/center/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await MeetingPointModel.find({ centerId: checkedId });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    //A young can only see his own meetingPoint.
    if (isYoung(req.user) && checkedId !== req.user.meetingPointId) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (isReferent(req.user) && !canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await MeetingPointModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const bus = await BusModel.findById(data.busId);
    return res.status(200).send({ ok: true, data: { ...data._doc, bus } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.user.cohesionCenterId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    let data = [];
    if (req.user.department) data = await MeetingPointModel.find({ departureDepartment: req.user.department, centerCode: center.code });
    for (let i = 0; i < data.length; i++) {
      const bus = await BusModel.findById(data[i].busId);
      data[i] = { ...data[i]._doc, bus };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.user.cohesionCenterId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    let data = [];
    if (req.user.department) data = await MeetingPointModel.find({ departureDepartment: req.user.department, centerCode: center.code });
    for (let i = 0; i < data.length; i++) {
      const bus = await BusModel.findById(data[i].busId);
      data[i] = { ...data[i]._doc, bus };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const { error, value } = Joi.object({
    id: Joi.string().required(),
    departureAddress: Joi.string().required(),
    departureAtString: Joi.string().required(),
    returnAtString: Joi.string().required(),
  }).validate({ ...req.params, ...req.body });
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  if (!canUpdateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

  const meetingPoint = await MeetingPointModel.findById(value.id);
  if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  meetingPoint.set({
    departureAddress: value.departureAddress,
    departureAt: value.departureAt,
    returnAt: value.returnAt,
    departureAtString: value.departureAtString,
    returnAtString: value.returnAtString,
  });

  meetingPoint.save({ fromUser: req.user });

  return res.status(200).send({ ok: true, data: meetingPoint });
});

module.exports = router;
