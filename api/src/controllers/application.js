const express = require("express");
const router = express.Router();
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const { capture } = require("../sentry");
const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const { sendEmail, sendTemplate } = require("../sendinblue");
const { ERRORS, isYoung } = require("../utils");
const { validateUpdateApplication, validateNewApplication } = require("../utils/validator");
const { ADMIN_URL } = require("../config");
const { SUB_ROLES, ROLES, SENDINBLUE_TEMPLATES, department2region } = require("snu-lib");
const { serializeApplication } = require("../utils/serializer");

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
      return;
    }
    // if at least one application is not ABANDON or CANCEL, phase 2 is in progress
    if (["WAITING_VALIDATION", "VALIDATED", "IN_PROGRESS"].includes(application.status)) {
      young.set({ statusPhase2: "IN_PROGRESS" });
    }
  }
  await young.save();
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
    }
  } catch (e) {
    console.log(e);
  }
};

router.post("/", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  try {
    const { value, error } = validateNewApplication(req.body, req.user);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!value.hasOwnProperty("priority")) {
      const applications = await ApplicationObject.find({ youngId: value.youngId });
      value.priority = applications.length + 1;
    }
    const mission = await MissionObject.findById(value.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(value.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await ApplicationObject.create(value);
    await updateStatusPhase2(data);
    await updatePlacesMission(data);
    return res.status(200).send({ ok: true, data: serializeApplication(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { value, error } = validateUpdateApplication(req.body, req.user);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const application = await ApplicationObject.findById(value._id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    application.set(value);
    await application.save();

    await updateStatusPhase2(application);
    await updatePlacesMission(application);
    res.status(200).send({ ok: true, data: serializeApplication(application) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await ApplicationObject.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeApplication(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/young/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (isYoung(req.user) && req.user._id.toString() !== id) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let data = await ApplicationObject.find({ youngId: id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      let tutor = {};
      if (mission?.tutorId) tutor = await ReferentObject.findById(mission.tutorId);
      if (mission?.tutorId && !application.tutorId) application.tutorId = mission.tutorId;
      if (mission?.structureId && !application.structureId) application.structureId = mission.structureId;
      data[i] = { ...serializeApplication(application), mission, tutor };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/mission/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await ApplicationObject.find({ missionId: id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i]._doc;
      const mission = await MissionObject.findById(application.missionId);
      data[i] = { ...serializeApplication(application), mission };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/notify/docs-military-preparation", passport.authenticate("young", { session: false }), async (req, res) => {
  // get the referent_department manager_phase2
  let toReferent = await ReferentObject.findOne({
    subRole: SUB_ROLES.manager_phase2,
    role: ROLES.REFERENT_DEPARTMENT,
    department: req.user.department,
  });
  // if not found, get the referent_region
  if (!toReferent) {
    toReferent = await ReferentObject.findOne({
      subRole: SUB_ROLES.manager_phase2,
      role: ROLES.REFERENT_REGION,
      region: department2region[req.user.department],
    });
  }
  // if not found, get the manager_department
  if (!toReferent) {
    toReferent = await ReferentObject.findOne({
      subRole: SUB_ROLES.manager_department,
      role: ROLES.REFERENT_DEPARTMENT,
      department: req.user.department,
    });
  }
  if (!toReferent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  const mail = await sendTemplate(parseInt(SENDINBLUE_TEMPLATES.REFERENT_MILITARY_PREPARATION_DOCS_SUBMITTED), {
    emailTo: [{ name: `${toReferent.firstName} ${toReferent.lastName}`, email: toReferent.email }],
    params: { cta: `${ADMIN_URL}/volontaire/${req.user._id}/phase2`, youngFirstName: req.user.firstName, youngLastName: req.user.lastName },
  });
  return res.status(200).send({ ok: true, data: mail });
});

router.post("/:id/notify/:template", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      template: Joi.string().required(),
      message: Joi.string().optional(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { id, template, message } = value;

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const mission = await MissionObject.findById(application.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const referent = await ReferentObject.findById(mission.tutorId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== application.youngId) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

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
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/auth/login?redirect=candidature");
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
        .replace(/{{message}}/g, message)
        .replace(/{{cta}}/g, "https://inscription.snu.gouv.fr/auth/login?redirect=mission")
        .replace(/\n/g, "<br/>");
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
