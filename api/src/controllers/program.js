const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const ProgramObject = require("../models/program");
const { ERRORS } = require("../utils");

// router.post("/", async (req, res) => {
//   try {
//     const data = await StructureObject.create(req.body);
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

// router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
//   try {
//     let obj = req.body;
//     const data = await StructureObject.findByIdAndUpdate(req.user.structureId, obj, { new: true });
//     if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

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

router.get("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const data = await ProgramObject.find({ isNational: "true" });
    const filter = {};
    if (req.user.department) filter.department = req.user.department;
    else if (req.user.region) filter.region = req.user.region;
    let dataZone = [];
    if (filter.department || filter.region) dataZone = await ProgramObject.find(filter);
    return res.status(200).send({ ok: true, data: [...data, ...dataZone] });
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
