const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const { ProgramModel } = require("../models");
const { ERRORS, isYoung } = require("../utils");
const { validateId, validateString, validateArray, validateProgram } = require("../utils/validator");
const { ROLES, canCreateOrUpdateProgram } = require("snu-lib");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedProgram } = validateProgram(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await ProgramModel.create(checkedProgram);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorProgram, value: checkedProgram } = validateProgram(req.body);
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorProgram || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    if (!canCreateOrUpdateProgram(req.user, checkedProgram)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let obj = checkedProgram;
    const data = await ProgramModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    data.set(obj);
    await data.save();
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const data = await ProgramModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === ROLES.ADMIN) data = await ProgramModel.find({});
    else if (req.user.role === ROLES.HEAD_CENTER) data = await ProgramModel.find({ visibility: "HEAD_CENTER" });
    else {
      let errorDepartement, checkedDepartement;
      if (isYoung(req.user)) {
        ({ error: errorDepartement, value: checkedDepartement } = validateString(req.user.department));
      } else {
        ({ error: errorDepartement, value: checkedDepartement } = validateArray(req.user.department));
      }
      const { error: errorRegion, value: checkedRegion } = validateString(req.user.region);
      if (errorDepartement || errorRegion) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      data = await ProgramModel.find({ $or: [{ visibility: "NATIONAL" }, { department: checkedDepartement }, { region: checkedRegion }] });
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/public/engagements", async (req, res) => {
  try {
    const data = await ProgramModel.find({ visibility: "NATIONAL" });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/public/engagement/:id", async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const data = await ProgramModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
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
    const program = await ProgramModel.findById(checkedId);
    if (!canCreateOrUpdateProgram(req.user, program)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await program.remove();
    console.log(`Program ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
