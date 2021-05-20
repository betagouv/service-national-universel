const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const Joi = require("joi");

const CohesionCenterModel = require("../models/cohesionCenter");
const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const { ERRORS, updatePlacesCenter } = require("../utils");

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
    if (center.placesLeft <= 0) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // update youngs infos
    young.set({
      // todo : WAITING_ACCEPTATION when all the communication is done
      statusPhase1: "AFFECTED",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
    });
    await young.save();
    await young.index();

    //if young is in waitingList of the center
    // todo check if the young is in antoher center's waiting list
    if (center.waitingList.indexOf(young._id) !== -1) {
      const i = center.waitingList.indexOf(young._id);
      center.waitingList.splice(i, 1);
      await center.save();
    }
    // update center infos
    const data = await updatePlacesCenter(center);

    return res.status(200).send({ data, ok: true });
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
