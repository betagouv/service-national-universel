const express = require("express");
const router = express.Router();
const passport = require("passport");
const fs = require("fs");
const path = require("path");

const { capture } = require("../sentry");
const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");
const { sendEmail } = require("../sendinblue");

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

router.post("/:id/notify/:template", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { id, template } = req.params;

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: NOT_FOUND + "_app" });
    const mission = await MissionObject.findById(application.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: NOT_FOUND + "_mission" });
    const referent = await ReferentObject.findById(mission.tutorId);
    if (!referent) return res.status(404).send({ ok: false, code: NOT_FOUND + "_referent" });

    let htmlContent = "";
    let subject = "";
    let to = {};

    if (template === "waiting_validation") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/application/waitingValidation.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, referent.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, referent.lastName);
      htmlContent = htmlContent.replace(/{{youngFirstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{youngLastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, mission.name);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr/volontaire");
      subject = `${application.youngFirstName} ${application.youngLastName} a candidaté sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "validated_responsible") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/application/validatedResponsible.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, referent.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, referent.lastName);
      htmlContent = htmlContent.replace(/{{youngFirstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{youngLastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, mission.name);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://admin.snu.gouv.fr/volontaire");
      subject = `${application.youngFirstName} ${application.youngLastName} est validée sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "validated_young") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/application/validatedYoung.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{structureName}}/g, mission.structureName);
      htmlContent = htmlContent.replace(/{{youngFirstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{youngLastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, mission.name);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      subject = `Votre candidature sur la mission d'intérêt général ${mission.name} a été validée`;
      to = { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail };
    } else if (template === "cancel") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/application/canceled.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, referent.firstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, referent.lastName);
      htmlContent = htmlContent.replace(/{{youngFirstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{youngLastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, mission.name);
      subject = `${application.youngFirstName} ${application.youngLastName} a annulé sa candidature sur votre mission d'intérêt général ${mission.name}`;
      to = { name: `${referent.firstName} ${referent.lastName}`, email: referent.email };
    } else if (template === "refused") {
      htmlContent = fs.readFileSync(path.resolve(__dirname, "../templates/application/refused.html")).toString();
      htmlContent = htmlContent.replace(/{{firstName}}/g, application.youngFirstName);
      htmlContent = htmlContent.replace(/{{lastName}}/g, application.youngLastName);
      htmlContent = htmlContent.replace(/{{structureName}}/g, mission.structureName);
      htmlContent = htmlContent.replace(/{{missionName}}/g, mission.name);
      htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/mission");
      subject = `Votre candidature sur la mission d'intérêt général ${mission.name} a été refusée.`;
      to = { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail };
    } else {
      throw new Error("Template de mail introuvable");
    }

    await sendEmail(to, subject, htmlContent);
    return res.status(200).send({ ok: true }); //todo
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
