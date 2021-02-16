const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");

const SERVER_ERROR = "SERVER_ERROR";
const NOT_FOUND = "NOT_FOUND";

router.post("/", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    if (!obj.hasOwnProperty("priority")) {
      const applications = await ApplicationObject.find({ youngId: obj.youngId });
      applications.length;
      obj.priority = applications.length + 1;
    }
    const data = await ApplicationObject.create(obj);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const application = await ApplicationObject.findByIdAndUpdate(req.body._id, req.body, { new: true });
    res.status(200).send({ ok: true, data: application });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ApplicationObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/young/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    let data = await ApplicationObject.find({ youngId: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      let tutor = {};
      if (mission) tutor = await ReferentObject.findById(mission.tutorId);
      data[i] = { ...application, mission, tutor };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/mission/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ApplicationObject.find({ missionId: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      data[i] = { ...application, mission };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

//@check
router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    await MissionObject.findOneAndUpdate({ _id: req.params.id }, { deleted: "yes" });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: SERVER_ERROR });
  }
});

module.exports = router;
