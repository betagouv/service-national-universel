const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const Joi = require("joi");

const CohesionCenterModel = require("../models/cohesionCenter");
const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MeetingPointObject = require("../models/meetingPoint");
const BusObject = require("../models/bus");
const { ERRORS, updatePlacesCenter, updatePlacesBus, sendAutoAffectationMail, sendAutoCancelMeetingPoint } = require("../utils");

router.post("/refresh/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.findById(req.params.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await updatePlacesCenter(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  // Validate params.
  // const { error, value: inscriptionsGoals } = Joi.array()
  //   .items({
  //     department: Joi.string().required(),
  //     region: Joi.string(),
  //     max: Joi.number().allow(null),
  //   })
  //   .validate(req.body, { stripUnknown: true });
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const data = await CohesionCenterModel.create(req.body);
    return res.status(200).send({ data, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:centerId/assign-young/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const center = await CohesionCenterModel.findById(req.params.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (center.placesLeft <= 0) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    let oldCenter = null;
    if (young.cohesionCenterId) {
      oldCenter = await CohesionCenterModel.findById(young.cohesionCenterId);
    }

    // update youngs infos
    young.set({
      status: "VALIDATED",
      statusPhase1: "AFFECTED",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
      // autoAffectationPhase1ExpiresAt: Date.now() + 60 * 1000 * 60 * 48,
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
      await sendAutoCancelMeetingPoint(young);
    }

    await young.save();

    // await sendAutoAffectationMail(young, center);

    //if young is in waitingList of the center
    // todo check if the young is in antoher center's waiting list
    if (center.waitingList.indexOf(young._id) !== -1) {
      const i = center.waitingList.indexOf(young._id);
      center.waitingList.splice(i, 1);
      await center.save();
    }
    if (oldCenter && oldCenter.waitingList.indexOf(young._id) !== -1) {
      const i = oldCenter.waitingList.indexOf(young._id);
      oldCenter.waitingList.splice(i, 1);
      await oldCenter.save();
    }
    // update center infos
    const data = await updatePlacesCenter(center);
    if (oldCenter) await updatePlacesCenter(oldCenter);
    if (bus) await updatePlacesBus(bus);

    return res.status(200).send({ data, young, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});
router.post("/:centerId/assign-young-waiting-list/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  // Validate params.
  // const { error, value: inscriptionsGoals } = Joi.array()
  //   .items({
  //     department: Joi.string().required(),
  //     region: Joi.string(),
  //     max: Joi.number().allow(null),
  //   })
  //   .validate(req.body, { stripUnknown: true });
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const center = await CohesionCenterModel.findById(req.params.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // update youngs infos
    young.set({
      statusPhase1: "WAITING_LIST",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
    });
    await young.save();
    await young.index();

    center.waitingList.push(young._id);
    await center.save();

    return res.status(200).send({ data: center, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.findById(req.params.id);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/head", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.params.id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ReferentModel.findOne({ role: "head_center", cohesionCenterId: center._id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});
router.get("/young/:youngId", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(404).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const center = await CohesionCenterModel.findByIdAndUpdate(req.body._id, req.body, { new: true });
    const data = await updatePlacesCenter(center);
    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findOne({ _id: req.params.id });
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await center.remove();
    console.log(`Center ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
