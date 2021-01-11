const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const MissionObject = require("../models/mission");

const SERVER_ERROR = "SERVER_ERROR";
const NOT_FOUND = "PASSWORD_TOKEN_EXPIRED_OR_INVALID";

router.post("/", async (req, res) => {
  try {
    const obj = {};
    // if (req.body.hasOwnProperty(`jobboard_indeed_status`)) obj.jobboard_indeed_status = req.body.jobboard_indeed_status;
    const data = await MissionObject.create(req.body);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    let obj = {};
    obj = req.body;
    const data = await MissionObject.findByIdAndUpdate(req.params.id, obj, { new: true });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await MissionObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const data = ""; //await MissionObject.find(req.query);
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: SERVER_ERROR, error });
//   }
// });

//@check
router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    await MissionObject.findOneAndUpdate({ _id: req.params.id }, { deleted: "yes" });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: SERVER_ERROR });
  }
});

module.exports = router;
