const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const ProgramObject = require("../models/program");
const { ERRORS } = require("../utils");
const { validateId, validateString } = require("../utils/validator/default");
const referentValidator = require("../utils/validator/referent");
const youngValidator = require("../utils/validator/young");
const { ROLES } = require("snu-lib/roles");

router.post("/", async (req, res) => {
  try {
    const { error, value: checkedProgram } = youngValidator.validateProgram(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await ProgramObject.create(checkedProgram);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorProgram, value: checkedProgram } = referentValidator.validateProgram(req.body);
    const { error: errorId, value: checkedId } = validateId(req.body._id);
    if (errorProgram || errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    let obj = checkedProgram;
    const data = await ProgramObject.findByIdAndUpdate(checkedId, obj, { new: true });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
//   try {
//     let obj = req.body;
//     const data = await StructureObject.findByIdAndUpdate(req.params.id, obj, { new: true });
//     if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

router.get("/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const data = await ProgramObject.findOne({ _id: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === ROLES.ADMIN) data = await ProgramObject.find({});
    else if (req.user.role === ROLES.HEAD_CENTER) data = await ProgramObject.find({ visibility: "HEAD_CENTER" });
    else {
      const { error: errorDepartement, value: checkedDepartement } = validateString(req.user.department);
      const { error: errorRegion, value: checkedRegion } = validateString(req.user.region);
      if (errorDepartement || errorRegion) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
      data = await ProgramObject.find({ $or: [{ visibility: "NATIONAL" }, { department: checkedDepartement }, { region: checkedRegion }] });
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const program = await ProgramObject.findOne({ _id: checkedId });
    await program.remove();
    console.log(`Program ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
