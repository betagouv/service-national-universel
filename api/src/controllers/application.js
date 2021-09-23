const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const { ERRORS, isYoung } = require("../utils");
const { validateUpdateApplication, validateNewApplication } = require("../utils/validator");
const { ADMIN_URL, APP_URL } = require("../config");
const { SUB_ROLES, ROLES, SENDINBLUE_TEMPLATES, department2region } = require("snu-lib");
const { serializeApplication } = require("../utils/serializer");
const { updateYoungPhase2Hours } = require("../utils");

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

const getReferentManagerPhase2 = async (department) => {
  // get the referent_department manager_phase2
  let toReferent = await ReferentObject.findOne({
    subRole: SUB_ROLES.manager_phase2,
    role: ROLES.REFERENT_DEPARTMENT,
    department,
  });
  // if not found, get the referent_region manager_phase2
  if (!toReferent) {
    toReferent = await ReferentObject.findOne({
      subRole: SUB_ROLES.manager_phase2,
      role: ROLES.REFERENT_REGION,
      region: department2region[department],
    });
  }
  // if not found, get the manager_department
  if (!toReferent) {
    toReferent = await ReferentObject.findOne({
      subRole: SUB_ROLES.manager_department,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }
  return toReferent;
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

    // A young can only update create their own applications.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

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

    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    application.set(value);
    await application.save();

    await updateStatusPhase2(application);
    await updatePlacesMission(application);
    await updateYoungPhase2Hours(young);
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

router.post("/notify/docs-military-preparation/:template", passport.authenticate("young", { session: false }), async (req, res) => {
  const { error, value: template } = Joi.string().required().validate(req.params.template);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

  const toReferent = await getReferentManagerPhase2(req.user.department);
  if (!toReferent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const mail = await sendTemplate(parseInt(template), {
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

    const { id, template: defaultTemplate, message } = value;

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const mission = await MissionObject.findById(application.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const referent = await ReferentObject.findById(mission.tutorId);
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== application.youngId) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let template = defaultTemplate;
    let emailTo;
    // build default values for params
    // => young name, and mission name
    let params = { youngFirstName: application.youngFirstName, youngLastName: application.youngLastName, missionName: mission.name };

    if (template === SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED) {
      emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
      params = { ...params, cta: `${ADMIN_URL}/volontaire` };
    } else if (template === SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
      params = { ...params, cta: `${APP_URL}/candidature` };
    } else if (template === SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION) {
      emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
    } else if (template === SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
      params = { ...params, message, cta: `${APP_URL}/mission` };
    } else if (template === SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION) {
      // when it is a new application, there are 2 possibilities
      if (mission.isMilitaryPreparation === "true") {
        const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
        emailTo = [{ name: `${referentManagerPhase2.firstName} ${referentManagerPhase2.lastName}`, email: referentManagerPhase2.email }];
        template = SENDINBLUE_TEMPLATES.referent.NEW_MILITARY_PREPARATION_APPLICATION;
        params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}` };
      } else {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
        params = { ...params, cta: `${ADMIN_URL}/volontaire` };
      }
    } else {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const mail = await sendTemplate(template, {
      emailTo,
      params,
    });
    return res.status(200).send({ ok: true, data: mail });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
