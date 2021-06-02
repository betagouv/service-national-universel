const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const DepartmentServiceModel = require("../models/departmentService");
const ReferentModel = require("../models/referent");
const CohesionCenterModel = require("../models/cohesionCenter");
const { ERRORS } = require("../utils");

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await DepartmentServiceModel.findOneAndUpdate({ department: req.body.department }, req.body, {
      new: true,
      upsert: true,
      useFindAndModify: false,
    });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/referent/:id", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const r = await ReferentModel.findById(req.params.id);
    if (!r) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await DepartmentServiceModel.findOne({ department: r.department });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/all", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const data = await DepartmentServiceModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["young"], { session: false }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.user.cohesionCenterId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await DepartmentServiceModel.findOne({ department: center.department });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
