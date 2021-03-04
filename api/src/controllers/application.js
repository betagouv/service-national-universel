const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");

const SERVER_ERROR = "SERVER_ERROR";
const NOT_FOUND = "NOT_FOUND";

const updateStatusPhase2 = async (app) => {
  const young = await YoungObject.findById(app.youngId);
  const applications = await ApplicationObject.find({ youngId: young._id });
  young.set({ statusPhase2: "WAITING_REALISATION" });
  for (let application of applications) {
    // if at least one application is DONE, phase 2 is validated
    if (application.status === "DONE") {
      young.set({ statusPhase2: "VALIDATED" });
      await young.save();
      await young.index();
      return;
    }
    // if at least one application is not ABANDON or CANCEL, phase 2 is in progress
    if (["WAITING_VALIDATION", "VALIDATED", "IN_PROGRESS"].includes(application.status)) {
      young.set({ statusPhase2: "IN_PROGRESS" });
    }
  }
  await young.save();
  await young.index();
};

const updatePlacesMission = async (app) => {
  try {
    // Get all application for the mission
    const mission = await MissionObject.findById(app.missionId);
    const applications = await ApplicationObject.find({ missionId: mission._id });
    const placesTaken = applications.filter((application) => {
      return ["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status);
    }).length;
    const placesLeft = Math.max(0, mission.placesTotal - placesTaken);
    if (mission.placesLeft !== placesLeft) {
      console.log(`Mission ${mission.id}: total ${mission.placesTotal}, left from ${mission.placesLeft} to ${placesLeft}`);
      mission.set({ placesLeft });
      await mission.save();
      await mission.index();
    }
  } catch (e) {
    console.log(e);
  }
};

router.post("/", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    if (!obj.hasOwnProperty("priority")) {
      const applications = await ApplicationObject.find({ youngId: obj.youngId });
      applications.length;
      obj.priority = applications.length + 1;
    }
    const data = await ApplicationObject.create(obj);
    await updateStatusPhase2(data);
    await updatePlacesMission(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const application = await ApplicationObject.findByIdAndUpdate(req.body._id, req.body, { new: true });
    await updateStatusPhase2(application);
    await updatePlacesMission(application);
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
