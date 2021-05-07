const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const Joi = require("joi");

const CohesionCenterModel = require("../models/cohesionCenter");
const ReferentModel = require("../models/referent");
const { ERRORS } = require("../utils");

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

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(404).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const center = await CohesionCenterModel.findByIdAndUpdate(req.body._id, req.body, { new: true });
    res.status(200).send({ ok: true, data: center });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// router.post("/current", passport.authenticate("referent", { session: false }), async (req, res) => {
//   const { error, value } = Joi.object({ department: Joi.string().required() }).unknown().validate(req.body);

//   if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

//   try {
//     const y2020 = await YoungModel.find({ cohort: "2020", statusPhase1: "WAITING_AFFECTATION", department: value.department }).count();
//     const y2021 = await YoungModel.find({ cohort: "2021", status: "VALIDATED", department: value.department }).count();
//     const yWL = await YoungModel.find({ status: "WAITING_LIST", department: value.department }).count();
//     const data = { registered: y2020 + y2021, waitingList: yWL };
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

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
