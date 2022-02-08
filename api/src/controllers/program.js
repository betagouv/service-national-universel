const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const ProgramObject = require("../models/program");
const { ERRORS } = require("../utils");
const { validateId, validateString, validateProgram } = require("../utils/validator");
const { ROLES, canCreateOrUpdateProgram } = require("snu-lib/roles");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedProgram } = validateProgram(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await ProgramObject.create(checkedProgram);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorProgram, value: checkedProgram } = validateProgram(req.body);
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorProgram || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let obj = checkedProgram;
    const data = await ProgramObject.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    data.set(obj);
    await data.save();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const data = await ProgramObject.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === ROLES.ADMIN) data = await ProgramObject.find({});
    else if (req.user.role === ROLES.HEAD_CENTER) data = await ProgramObject.find({ visibility: "HEAD_CENTER" });
    else {
      const { error: errorDepartement, value: checkedDepartement } = validateString(req.user.department);
      const { error: errorRegion, value: checkedRegion } = validateString(req.user.region);
      if (errorDepartement) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorDepartement });
      if (errorRegion) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorRegion });
      data = await ProgramObject.find({ $or: [{ visibility: "NATIONAL" }, { department: checkedDepartement }, { region: checkedRegion }] });
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const program = await ProgramObject.findById(checkedId);
    await program.remove();
    console.log(`Program ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
