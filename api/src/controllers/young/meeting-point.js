const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const MeetingPointModel = require("../../models/meetingPoint");
const BusModel = require("../../models/bus");
const { ERRORS, updatePlacesBus, isYoung } = require("../../utils");
const { serializeMeetingPoint, serializeYoung } = require("../../utils/serializer");
const { validateId } = require("../../utils/validator");

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await MeetingPointModel.findById(young.meetingPointId);

    return res.status(200).send({ ok: true, data: data ? serializeMeetingPoint(data) : null });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/cancel", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const oldMeetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const oldBus = await BusModel.findById(oldMeetingPoint?.busId);

    young.set({ meetingPointId: undefined, deplacementPhase1Autonomous: undefined });
    await young.save({ fromUser: req.user });

    if (oldBus) await updatePlacesBus(oldBus);

    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      meetingPointId: Joi.string().optional(),
      deplacementPhase1Autonomous: Joi.string().optional(),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const { id, meetingPointId, deplacementPhase1Autonomous } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update their own meeting points.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let bus = null;

    //choosing a meetingPoint
    if (meetingPointId) {
      const meetingPoint = await MeetingPointModel.findById(meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      bus = await BusModel.findById(meetingPoint.busId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (bus.placesLeft <= 0) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    const oldMeetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const oldBus = await BusModel.findById(oldMeetingPoint?.busId);

    young.set({ meetingPointId, deplacementPhase1Autonomous });
    await young.save({ fromUser: req.user });

    if (bus) await updatePlacesBus(bus);
    if (oldBus) await updatePlacesBus(oldBus);
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
