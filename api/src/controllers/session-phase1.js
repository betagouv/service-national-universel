const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const SessionPhase1Model = require("../models/sessionPhase1");
const CohesionCenterModel = require("../models/cohesionCenter");
const YoungModel = require("../models/young");
const MeetingPointObject = require("../models/meetingPoint");
const BusObject = require("../models/bus");
const { ERRORS, updatePlacesSessionPhase1, updatePlacesBus } = require("../utils");
const { ROLES, canCreateOrUpdateSessionPhase1 } = require("snu-lib/roles");
const { serializeSessionPhase1, serializeCohesionCenter, serializeYoung } = require("../utils/serializer");
const { validateSessionPhase1, validateId } = require("../utils/validator");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSessionPhase1(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await SessionPhase1Model.create(value);
    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await SessionPhase1Model.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/cohesion-center", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await SessionPhase1Model.find({});
    return res.status(200).send({ ok: true, data: data.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorId });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrUpdateSessionPhase1(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error, value } = validateSessionPhase1(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    sessionPhase1.set(value);
    await sessionPhase1.save();

    const data = await updatePlacesSessionPhase1(sessionPhase1);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const sessionPhase1 = await SessionPhase1Model.findById(id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrUpdateSessionPhase1(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await sessionPhase1.remove();

    console.log(`sessionPhase1 ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/assign-young/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ youngId: Joi.string().required(), sessionId: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { youngId, sessionId } = value;
    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const oldSession = young.sessionPhase1Id ? await SessionPhase1Model.findById(young.sessionPhase1Id) : null;

    // update youngs infos
    young.set({
      status: "VALIDATED",
      statusPhase1: "AFFECTED",
      sessionPhase1Id: sessionId,
    });

    //if the young has already a meetingPoint and therefore a place taken in a bus
    let bus = null;
    if (young.meetingPointId) {
      console.log(`affect ${young.id} but is already in meetingPoint ${young.meetingPointId}`);
      const meetingPoint = await MeetingPointObject.findById(young.meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      bus = await BusObject.findById(meetingPoint.busId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      console.log(`${young.id} is in bus ${bus.idExcel}`);
    }

    // if young has confirmed their meetingPoint, as we will cancel it, we notify them
    if (young.meetingPointId || young.deplacementPhase1Autonomous === "true") {
      young.set({ meetingPointId: undefined, deplacementPhase1Autonomous: undefined });
    }

    await young.save({ fromUser: req.user });

    // update session infos
    const data = await updatePlacesSessionPhase1(session);
    if (oldSession) await updatePlacesSessionPhase1(oldSession);
    if (bus) await updatePlacesBus(bus);

    return res.status(200).send({
      data: serializeSessionPhase1(data, req.user),
      young: serializeYoung(young, req.user),
      ok: true,
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
