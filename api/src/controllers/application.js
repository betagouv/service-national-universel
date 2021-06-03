const express = require("express");
const router = express.Router();
const passport = require("passport");
const fs = require("fs");
const path = require("path");

const { capture } = require("../sentry");
const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const { sendEmail } = require("../sendinblue");
const { ERRORS } = require("../utils");

const updateStatusPhase2 = async (app) => {
  const young = await YoungObject.findById(app.youngId);
  const applications = await ApplicationObject.find({ youngId: young._id });
  young.set({ statusPhase2: "WAITING_REALISATION" });
  young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
  for (let application of applications) {
    // if at least one application is DONE, phase 2 is validated
    if (application.status === "DONE") {
      young.set({ statusPhase2: "VALIDATED", phase: "CONTINUE" });
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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ApplicationObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/young/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    let data = await ApplicationObject.find({ youngId: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      let tutor = {};
      if (mission?.tutorId) tutor = await ReferentObject.findById(mission.tutorId);
      if (mission?.tutorId && !application.tutorId) application.tutorId = mission.tutorId;
      if (mission?.structureId && !application.structureId) application.structureId = mission.structureId;
      data[i] = { ...application, mission, tutor };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/mission/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ApplicationObject.find({ missionId: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      data[i] = { ...application, mission };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

//@check
router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    await MissionObject.findOneAndUpdate({ _id: req.params.id }, { deleted: "yes" });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/notify/:template", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { id, template } = req.params;

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const mission = await MissionObject.findById(application.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const referent = await ReferentObject.findById(mission.tutorId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let htmlContent = "";
    let subject = "";
    let to = {};

    if (template === "waiting_validation") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/application/waitingValidation.html"))
        .toString()
        .replace(/{{firstName}}/g, referent.firstName)
        .replace(/{{lastName}}/g, referent.lastName)
        .replace(/{{youngFirstName}}/g, application.youngFirstName)
        .replace(/{{youngLastName}}/g, application.youngLastName)
        .replace(/{{missionName}}/g, mission.name)
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr/volontaire");
      subject = `${application.youngFirstName} ${application.youngLastName} a candidaté sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "validated_responsible") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/application/validatedResponsible.html"))
        .toString()
        .replace(/{{firstName}}/g, referent.firstName)
        .replace(/{{lastName}}/g, referent.lastName)
        .replace(/{{youngFirstName}}/g, application.youngFirstName)
        .replace(/{{youngLastName}}/g, application.youngLastName)
        .replace(/{{missionName}}/g, mission.name)
        .replace(/{{cta}}/g, "https://admin.snu.gouv.fr/volontaire");
      subject = `${application.youngFirstName} ${application.youngLastName} est validée sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "validated_young") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/application/validatedYoung.html"))
        .toString()
        .replace(/{{firstName}}/g, application.youngFirstName)
        .replace(/{{lastName}}/g, application.youngLastName)
        .replace(/{{structureName}}/g, mission.structureName)
        .replace(/{{youngFirstName}}/g, application.youngFirstName)
        .replace(/{{youngLastName}}/g, application.youngLastName)
        .replace(/{{missionName}}/g, mission.name)
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      subject = `Votre candidature sur la mission d'intérêt général ${mission.name} a été validée`;
      to = { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail };
    } else if (template === "cancel") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/application/cancel.html"))
        .toString()
        .replace(/{{firstName}}/g, referent.firstName)
        .replace(/{{lastName}}/g, referent.lastName)
        .replace(/{{youngFirstName}}/g, application.youngFirstName)
        .replace(/{{youngLastName}}/g, application.youngLastName)
        .replace(/{{missionName}}/g, mission.name);
      subject = `${application.youngFirstName} ${application.youngLastName} a annulé sa candidature sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "refused") {
      htmlContent = fs
        .readFileSync(path.resolve(__dirname, "../templates/application/refused.html"))
        .toString()
        .replace(/{{firstName}}/g, application.youngFirstName)
        .replace(/{{lastName}}/g, application.youngLastName)
        .replace(/{{structureName}}/g, mission.structureName)
        .replace(/{{missionName}}/g, mission.name)
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/mission");
      subject = `Votre candidature sur la mission d'intérêt général ${mission.name} a été refusée.`;
      to = { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail };
    } else {
      return res.status(200).send({ ok: true });
    }

    await sendEmail(to, subject, htmlContent);
    return res.status(200).send({ ok: true }); //todo
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
