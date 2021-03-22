const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const ProgramObject = require("../models/program");
const { ERRORS } = require("../utils");

router.post("/", async (req, res) => {
  try {
    const data = await ProgramObject.create(req.body);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    let obj = req.body;
    const data = await ProgramObject.findByIdAndUpdate(req.body._id, obj, { new: true });
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
    const data = await ProgramObject.findOne({ _id: req.params.id });
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
    if (req.user.role === "admin") data = await ProgramObject.find({});
    else data = await ProgramObject.find({ $or: [{ visibility: "NATIONAL" }, { department: req.user.department }, { region: req.user.region }] });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
//   try {
//     const structure = await StructureObject.findOne({ _id: req.params.id });
//     await structure.remove();
//     console.log(`Structure ${req.params.id} has been deleted`);
//     res.status(200).send({ ok: true });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
//   }
// });

module.exports = router;
