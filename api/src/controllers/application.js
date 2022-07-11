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
const { decrypt, encrypt } = require("../cryptoUtils");
const NodeClam = require("clamscan");
const fs = require("fs");
const FileType = require("file-type");
const fileUpload = require("express-fileupload");
const { sendTemplate } = require("../sendinblue");
const { validateUpdateApplication, validateNewApplication } = require("../utils/validator");
const { ADMIN_URL, APP_URL } = require("../config");
const { SUB_ROLES, ROLES, SENDINBLUE_TEMPLATES, department2region, canCreateYoungApplication, canViewYoungApplications, canApplyToPhase2 } = require("snu-lib");
const { serializeApplication, serializeYoung } = require("../utils/serializer");
const { config } = require("dotenv");
const {
  uploadFile,
  ERRORS,
  isYoung,
  isReferent,
  // updateApplicationsWithYoungOrMission,
  getCcOfYoung,
  updateYoungPhase2Hours,
  updateStatusPhase2,
  getFile,
  updateYoungStatusPhase2Contract,
} = require("../utils");
const { translateAddFilePhase2, translateAddFilesPhase2 } = require("snu-lib/translation");
const mime = require("mime-types");

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

    if (!canApplyToPhase2(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
      type: Joi.string().optional(),
      multipleDocument: Joi.string().optional(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { id, template: defaultTemplate, message, type, multipleDocument } = value;

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
    } else if (template === SENDINBLUE_TEMPLATES.referent.ATTACHEMENT_PHASE_2_APPLICATION) {
      if (isYoung(req.user)) {
        //second email
        const emailTo2 = [{ name: referent.youngFirstName, lastName: referent.youngLastName, email: referent.email }];
        const params2 = {
          ...params,
          cta: `${ADMIN_URL}/mission/${mission._id}/youngs`,
          firstName: application.youngFirstName,
          lastName: application.youngLastName,
          type_document: `${multipleDocument === "true" ? translateAddFilesPhase2(type) : translateAddFilePhase2(type)}`,
        };
        await sendTemplate(template, {
          emailTo: emailTo2,
          params: params2,
        });

        const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
        emailTo = [{ name: referentManagerPhase2.firstName, lastName: referentManagerPhase2.lastName, email: referentManagerPhase2.email }];
        params = {
          ...params,
          cta: `${ADMIN_URL}/volontaire/${application.youngId}/phase2`,
          firstName: application.youngFirstName,
          lastName: application.youngLastName,
          type_document: `${multipleDocument === "true" ? translateAddFilesPhase2(type) : translateAddFilePhase2(type)}`,
        };
      } else {
        emailTo = [{ name: referent.youngFirstName, lastName: referent.youngLastName, email: referent.email }];
        params = {
          ...params,
          cta: `${APP_URL}/mission/${mission.structureId}`,
          firstName: referent.firstName,
          lastName: referent.lastName,
          type_document: `${multipleDocument === "true" ? translateAddFilesPhase2(type) : translateAddFilePhase2(type)}`,
        };
      }
    } else {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    let cc = isYoung(req.user) ? getCcOfYoung({ template, young }) : [];
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

router.post(
  "/:id/file/:key",
  passport.authenticate(["referent", "young"], { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const application = await ApplicationObject.findById(req.params.id);
      const rootKeys = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];
      const { error: keyError, value: key } = Joi.string()
        .required()
        .valid(...rootKeys)
        .validate(req.params.key);
      if (keyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { error: bodyError, value: body } = Joi.string().required().validate(req.body.body);
      if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const {
        error: namesError,
        value: { names },
      } = Joi.object({ names: Joi.array().items(Joi.string()).required() }).validate(JSON.parse(body), { stripUnknown: true });
      if (namesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const user = await YoungObject.findById(application.youngId);
      if (!user) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

      // Validate files with Joi
      const { error: filesError, value: files } = Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.object({
              name: Joi.string().required(),
              data: Joi.binary().required(),
              tempFilePath: Joi.string().allow("").optional(),
            }).unknown(),
            Joi.array().items(
              Joi.object({
                name: Joi.string().required(),
                data: Joi.binary().required(),
                tempFilePath: Joi.string().allow("").optional(),
              }).unknown(),
            ),
          ),
        )
        .validate(
          Object.keys(req.files || {}).map((e) => req.files[e]),
          { stripUnknown: true },
        );
      if (filesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      //const application = await ApplicationObject.find({ youngId: req.user._id });
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.APPLICATION_NOT_FOUND });

      for (let i = 0; i < files.length; i++) {
        let currentFile = files[i];
        // If multiple file with same names are provided, currentFile is an array. We just take the latest.
        if (Array.isArray(currentFile)) {
          currentFile = currentFile[currentFile.length - 1];
        }
        const { name, tempFilePath, mimetype } = currentFile;
        const { mime: mimeFromMagicNumbers } = await FileType.fromFile(tempFilePath);
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
          fs.unlinkSync(tempFilePath);
          return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }
        if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
          const clamscan = await new NodeClam().init({
            removeInfected: true,
          });
          const { isInfected } = await clamscan.isInfected(tempFilePath);
          if (isInfected) {
            fs.unlinkSync(tempFilePath);
            return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
          }
        }
        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: "image/png", encoding: "7bit", data: encryptedBuffer };
        await uploadFile(`app/young/${user._id}/application/${key}/${name}`, resultingFile);
        //get application et get j eunes
        fs.unlinkSync(tempFilePath);
      }
      application.set({ [key]: names });
      await application.save({ fromUser: req.user });
      return res.status(200).send({ young: serializeYoung(user, user), data: names, ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get("/:id/file/:key/:name", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      key: Joi.string().required(),
      name: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { id, key, name } = value;

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== young?._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const downloaded = await getFile(`app/young/${young._id}/application/${key}/${name}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile = null;
    try {
      const { mime } = await FileType.fromBuffer(decryptedBuffer);
      mimeFromFile = mime;
    } catch (e) {
      //
    }

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(name),
      fileName: name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
