const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const ApplicationObject = require("../models/application");
const MissionObject = require("../models/mission");
const StructureObject = require("../models/structure");
const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const { ERRORS, isYoung, isReferent } = require("../utils");
const { validateUpdateApplication, validateNewApplication } = require("../utils/validator");
const { ADMIN_URL, APP_URL } = require("../config");
const { SUB_ROLES, ROLES, SENDINBLUE_TEMPLATES, department2region, canCreateYoungApplication, canViewYoungApplications } = require("snu-lib");
const { serializeApplication } = require("../utils/serializer");
const { updateYoungPhase2Hours, updateStatusPhase2, updateYoungStatusPhase2Contract, getCcOfYoung } = require("../utils");

const updatePlacesMission = async (app, fromUser) => {
  try {
    // Get all application for the mission
    const mission = await MissionObject.findById(app.missionId);
    const applications = await ApplicationObject.find({ missionId: mission._id });
    const placesTaken = applications.filter((application) => {
      return ["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status);
    }).length;
    const placesLeft = Math.max(0, mission.placesTotal - placesTaken);
    if (mission.placesLeft !== placesLeft) {
      console.log(`Mission ${mission.id}: total ${mission.placesTotal}, left from ${mission.placesLeft} to ${placesLeft}`);
      mission.set({ placesLeft });
      await mission.save({ fromUser });
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

router.post("/:id/change-classement/:rank", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const JoiId = Joi.string().required().validate(req.params.id);
    if (JoiId.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const JoiRank = Joi.string().required().validate(req.params.rank);
    if (JoiRank.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const application = await ApplicationObject.findById(JoiId.value);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const allApplications = await ApplicationObject.find({ youngId: young._id.toString() });
    const allApplicationsSorted = allApplications.sort((a, b) => Number(a.priority) - Number(b.priority));
    const currentIndex = allApplicationsSorted.findIndex((app) => app._id.toString() === application._id.toString());

    // on l'enlève de sa position initiale
    allApplicationsSorted.splice(currentIndex, 1);
    // et on l'insère au nouveau rang
    allApplicationsSorted.splice(JoiRank.value, 0, application);

    for (const i in allApplicationsSorted) {
      const applicationTemp = allApplicationsSorted[i];
      applicationTemp.set({ priority: Number(i) + 1 });
      await applicationTemp.save({ fromUser: req.user });
    }
    return res.status(200).send({ ok: true, data: allApplicationsSorted.map(serializeApplication) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = validateNewApplication(req.body, req.user);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!("priority" in value)) {
      const applications = await ApplicationObject.find({ youngId: value.youngId });
      value.priority = applications.length + 1;
    }
    const mission = await MissionObject.findById(value.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    value.isJvaMission = mission.isJvaMission;

    const young = await YoungObject.findById(value.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only create their own applications.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    // - admin can create all applications
    // - referent can create applications of their department/region
    // - responsible and supervisor can create applications of their structures
    if (isReferent(req.user)) {
      if (!canCreateYoungApplication(req.user, young)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      if (req.user.role === ROLES.RESPONSIBLE) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (value.structureId.toString() !== req.user.structureId.toString()) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureObject.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures.map((e) => e._id.toString()).includes(value.structureId.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
    }

    const data = await ApplicationObject.create(value);
    await updateYoungPhase2Hours(young);
    await updateStatusPhase2(young);
    await updatePlacesMission(data, req.user);
    await updateYoungStatusPhase2Contract(young, req.user);
    return res.status(200).send({ ok: true, data: serializeApplication(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = validateUpdateApplication(req.body, req.user);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const application = await ApplicationObject.findById(value._id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // - admin can update all applications
    // - referent can update applications of their department/region
    // - responsible and supervisor can update applications of their structures
    if (isReferent(req.user)) {
      if (!canCreateYoungApplication(req.user, young)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      if (req.user.role === ROLES.RESPONSIBLE) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (application.structureId.toString() !== req.user.structureId.toString()) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureObject.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures.map((e) => e._id.toString()).includes(application.structureId.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
    }

    application.set(value);
    await application.save({ fromUser: req.user });

    await updateYoungPhase2Hours(young);
    await updateStatusPhase2(young);
    await updateYoungStatusPhase2Contract(young, req.user);
    await updatePlacesMission(application, req.user);

    res.status(200).send({ ok: true, data: serializeApplication(application) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/visibilite", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const joiId = Joi.string().required().validate(req.params.id);
    if (joiId.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // const joiBody = validateUpdateApplication(req.body, req.user);
    const joiBody = Joi.object()
      .keys({ hidden: Joi.string().allow(null, "") })
      .validate(req.body, { stripUnknown: true });
    if (joiBody.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const application = await ApplicationObject.findById(joiId.value);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    application.set({ hidden: joiBody.value.hidden });
    await application.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeApplication(application) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const data = await ApplicationObject.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(data.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewYoungApplications(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    return res.status(200).send({ ok: true, data: serializeApplication(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/notify/docs-military-preparation/:template", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  const { error, value: template } = Joi.string().required().validate(req.params.template);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

  const toReferent = await getReferentManagerPhase2(req.user.department);
  if (!toReferent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  if (SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED !== template) {
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  }

  const mail = await sendTemplate(parseInt(template), {
    emailTo: [{ name: `${toReferent.firstName} ${toReferent.lastName}`, email: toReferent.email }],
    params: { cta: `${ADMIN_URL}/volontaire/${req.user._id}/phase2`, youngFirstName: req.user.firstName, youngLastName: req.user.lastName },
  });
  return res.status(200).send({ ok: true, data: mail });
});

router.post("/:id/notify/:template", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
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
    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== application.youngId) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // - admin can notify for all applications
    // - referent can notify for applications of their department/region
    // - responsible and supervisor can notify for applications of their structures
    if (isReferent(req.user)) {
      if (!canCreateYoungApplication(req.user, young)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      if (req.user.role === ROLES.RESPONSIBLE) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (application.structureId.toString() !== req.user.structureId.toString()) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureObject.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures.map((e) => e._id.toString()).includes(application.structureId.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
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
      params = { ...params, cta: `${APP_URL}/candidature?utm_campaign=transactionel+mig+candidature+approuvee&utm_source=notifauto&utm_medium=mail+151+faire` };
    } else if (template === SENDINBLUE_TEMPLATES.referent.VALIDATE_APPLICATION_TUTOR) {
      emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
      params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}` };
    } else if (template === SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION) {
      emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
    } else if (template === SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
    } else if (template === SENDINBLUE_TEMPLATES.referent.ABANDON_APPLICATION) {
      emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
    } else if (template === SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
      params = { ...params, message, cta: `${APP_URL}/mission?utm_campaign=transactionnel+mig+candidature+nonretenue&utm_source=notifauto&utm_medium=mail+152+candidater` };
    } else if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_REMINDER) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
    } else if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_REMINDER_RENOTIFY) {
      emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
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
    let cc = getCcOfYoung({ template, young });
    const mail = await sendTemplate(template, {
      emailTo,
      params,
      cc,
    });
    return res.status(200).send({ ok: true, data: mail });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
