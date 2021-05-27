const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const DepartmentServiceModel = require("../models/departmentService");
const ReferentModel = require("../models/referent");
const { ERRORS, validateId } = require("../utils");
const validateFromReferent = require("../utils/referent")

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedDepartementService } = validateFromReferent.validateDepartementService(req.body);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await DepartmentServiceModel.findOneAndUpdate({ department: checkedDepartementService.department}, checkedDepartementService, {
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
    const { error, value : checkedId } = validateId(req.params.id);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const r = await ReferentModel.findById(checkedId);
    if (!r) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await DepartmentServiceModel.findOne({ department: r.department });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const data = await DepartmentServiceModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
