const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const StructureObject = require("../models/structure");

const SERVER_ERROR = "SERVER_ERROR";
const NOT_FOUND = "PASSWORD_TOKEN_EXPIRED_OR_INVALID";

router.post("/", async (req, res) => {
  try {
    const data = await StructureObject.create(req.body);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    let obj = req.body;
    const data = await StructureObject.findByIdAndUpdate(req.user.structureId, obj, { new: true });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.findById(req.user.structureId);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

//@check
router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  // try {
  //   await StructureObject.findOneAndUpdate({ _id: req.params.id }, { deleted: "yes" });
  //   res.status(200).send({ ok: true });
  // } catch (error) {
  //   capture(error);
  //   res.status(500).send({ ok: false, error, code: SERVER_ERROR });
  // }
});

module.exports = router;
