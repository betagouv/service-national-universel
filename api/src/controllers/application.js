const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { ObjectId } = require("mongoose").Types;

const { capture, captureMessage } = require("../sentry");
const ApplicationObject = require("../models/application");
const ContractObject = require("../models/contract");
const MissionObject = require("../models/mission");
const StructureObject = require("../models/structure");
const YoungObject = require("../models/young");
const CohortObject = require("../models/cohort");
const ReferentObject = require("../models/referent");
const { decrypt, encrypt } = require("../cryptoUtils");
const fs = require("fs");
const FileType = require("file-type");
const fileUpload = require("express-fileupload");
const { sendTemplate } = require("../sendinblue");
const { validateUpdateApplication, validateNewApplication, validateId } = require("../utils/validator");
const { ENVIRONMENT, ADMIN_URL, APP_URL } = require("../config");
const {
  ROLES,
  SENDINBLUE_TEMPLATES,
  canCreateYoungApplication,
  canViewYoungApplications,
  canApplyToPhase2,
  canViewContract,
  translateAddFilePhase2,
  translateAddFilesPhase2,
} = require("snu-lib");
const { serializeApplication, serializeYoung, serializeContract } = require("../utils/serializer");
const {
  uploadFile,
  ERRORS,
  isYoung,
  isReferent,
  getCcOfYoung,
  updateYoungPhase2Hours,
  updateStatusPhase2,
  getFile,
  updateYoungStatusPhase2Contract,
  getReferentManagerPhase2,
  updateYoungApplicationFilesType,
} = require("../utils");
const mime = require("mime-types");
const patches = require("./patches");
const scanFile = require("../utils/virusScanner");
const { getAuthorizationToApply } = require("../services/application");
const { apiEngagement } = require("../services/gouv.fr/api-engagement");

const canUpdateApplication = async (user, application, young, structures) => {
  // - admin can update all applications
  // - referent can update applications of their department/region
  // - responsible and supervisor can update applications of their structures
  if (user.role === ROLES.ADMIN) return true;
  if (isYoung(user) && application.youngId.toString() !== user._id.toString()) return false;
  if (isReferent(user)) {
    if (!canCreateYoungApplication(user, young)) return false;
    if (user.role === ROLES.RESPONSIBLE && (!user.structureId || application.structureId.toString() !== user.structureId.toString())) return false;
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return false;
      if (!structures.map((e) => e._id.toString()).includes(application.structureId.toString())) return false;
    }
  }
  return true;
};

async function updateMission(app, fromUser) {
  try {
    const mission = await MissionObject.findById(app.missionId);

    // Get all applications for the mission
    const placesTaken = await ApplicationObject.countDocuments({ missionId: mission._id, status: { $in: ["VALIDATED", "IN_PROGRESS", "DONE"] } });
    const placesLeft = Math.max(0, mission.placesTotal - placesTaken);
    if (mission.placesLeft !== placesLeft) {
      mission.set({ placesLeft });
    }

    if (placesLeft === 0) {
      mission.set({ placesStatus: "FULL" });
    } else if (placesLeft === mission.placesTotal) {
      mission.set({ placesStatus: "EMPTY" });
    } else {
      mission.set({ placesStatus: "ONE_OR_MORE" });
    }

    // On met à jour le nb de candidatures en attente.
    const pendingApplications = await ApplicationObject.countDocuments({
      missionId: mission._id,
      status: { $in: ["WAITING_VERIFICATION", "WAITING_VALIDATION"] },
    });

    if (mission.pendingApplications !== pendingApplications) {
      mission.set({ pendingApplications });
    }

    const allApplications = await ApplicationObject.find({ missionId: mission._id });
    mission.set({ applicationStatus: allApplications.map((e) => e.status) });

    await mission.save({ fromUser });
  } catch (e) {
    capture(e);
  }
}

router.post("/:id/change-classement/:rank", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const JoiId = validateId(req.params.id);
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { clickId } = Joi.object({ clickId: Joi.string().optional() }).validate(req.query, { stripUnknown: true }).value;

    if (!("priority" in value)) {
      const applications = await ApplicationObject.find({ youngId: value.youngId });
      value.priority = applications.length + 1;
    }
    const mission = await MissionObject.findById(value.missionId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // On vérifie si les candidatures sont ouvertes.
    if (mission.visibility === "HIDDEN") {
      console.log("visibility", mission.visibility);
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    value.isJvaMission = mission.isJvaMission;

    const young = await YoungObject.findById(value.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user)) {
      const { canApply, message } = await getAuthorizationToApply(mission, young);
      if (!canApply) {
        console.log(message);
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED, message });
      }
    }

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
      const cohort = await CohortObject.findOne({ name: young.cohort });
      if (!canApplyToPhase2(young, cohort)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    // On vérifie que la candidature n'existe pas déjà en base de donnée.
    const doublon = await ApplicationObject.findOne({ youngId: value.youngId, missionId: value.missionId });
    if (doublon) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (mission?.isJvaMission) {
      const { _id } = await apiEngagement.create(mission.jvaRawData._id, clickId);
      value.apiEngagementId = _id;
    }

    value.contractStatus = "DRAFT";
    const data = await ApplicationObject.create(value);

    await updateYoungPhase2Hours(young, req.user);
    await updateStatusPhase2(young, req.user);
    await updateMission(data, req.user);
    await updateYoungStatusPhase2Contract(young, req.user);

    return res.status(200).send({ ok: true, data: serializeApplication(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/multiaction/change-status/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const allowedKeys = ["WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"];
    const { error, value } = Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { errorKey, value: valueKey } = Joi.object({
      key: Joi.string()
        .trim()
        .required()
        .valid(...allowedKeys),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (errorKey) {
      capture(errorKey);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // Transform ids to ObjectId
    value.ids = value.ids.map((id) => ObjectId(id));

    const pipeline = [
      { $match: { _id: { $in: value.ids } } },
      {
        $addFields: {
          youngObjectId: {
            $toObjectId: "$youngId",
          },
        },
      },
      {
        $lookup: {
          from: "youngs",
          localField: "youngObjectId",
          foreignField: "_id",
          as: "young",
        },
      },
      { $unwind: "$young" },
    ];

    const applications = await ApplicationObject.aggregate(pipeline).exec();
    if (!applications || applications?.length !== value.ids?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    //check toutes les perms pour chaque application

    // if supervisor store structures --> avoid multiple mongoDb calls
    let structures = null;
    if (req.user.role === ROLES.SUPERVISOR) {
      if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      structures = await StructureObject.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
    }

    for (const application of applications) {
      const young = application.young;
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // A young can only update his own application.
      if (!canUpdateApplication(req.user, application, young, structures)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
    }

    value.ids.map(async (id) => {
      const application = await ApplicationObject.findById(id);
      const young = await YoungObject.findById(application.youngId);

      application.set({ status: valueKey.key });
      await application.save({ fromUser: req.user });

      if (application.isJvaMission) {
        await apiEngagement.update(application);
      }

      await updateYoungPhase2Hours(young, req.user);
      await updateStatusPhase2(young, req.user);
      await updateYoungStatusPhase2Contract(young, req.user);
      await updateMission(application, req.user);
    });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.put("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = validateUpdateApplication(req.body, req.user);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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

    await updateYoungPhase2Hours(young, req.user);
    await updateStatusPhase2(young, req.user);
    await updateYoungStatusPhase2Contract(young, req.user);
    await updateMission(application, req.user);

    if (application.isJvaMission) {
      await apiEngagement.update(application);
    }

    res.status(200).send({ ok: true, data: serializeApplication(application) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/visibilite", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const joiId = validateId(req.params.id);
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

router.get("/:id/contract", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const application = await ApplicationObject.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const contract = await ContractObject.findById(application.contractId);
    if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungObject.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && application.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (isReferent(req.user) && !canViewContract(req.user, contract)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    return res.status(200).send({ ok: true, data: serializeContract(contract, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
  try {
    const { error, value: template } = Joi.string().required().validate(req.params.template);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const toReferents = await getReferentManagerPhase2(req.user.department);
    if (!toReferents) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED !== template) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const mail = await sendTemplate(parseInt(template), {
      emailTo: toReferents.map((referent) => ({
        name: `${referent.firstName} ${referent.lastName}`,
        email: referent.email,
      })),
      params: { cta: `${ADMIN_URL}/volontaire/${req.user._id}/phase2`, youngFirstName: req.user.firstName, youngLastName: req.user.lastName },
    });
    return res.status(200).send({ ok: true, data: mail });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
      params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}/phase2/application/${application._id}/contrat` };
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
    } else if (template === SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION) {
      // when it is a new application, there are 2 possibilities
      if (mission.isMilitaryPreparation === "true") {
        if (young.statusMilitaryPreparationFiles === "VALIDATED") {
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED;
          params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}/phase2` };
        } else {
          const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
          emailTo = referentManagerPhase2.map((referent) => ({
            name: `${referent.firstName} ${referent.lastName}`,
            email: referent.email,
          }));
          template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED;
          params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}/phase2` };
        }
      } else {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
        params = { ...params, cta: `${ADMIN_URL}/volontaire${application.youngId}/phase2` };
      }
    } else if (template === SENDINBLUE_TEMPLATES.referent.RELANCE_APPLICATION) {
      // when it is a new application, there are 2 possibilities
      if (mission.isMilitaryPreparation === "true") {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED;
        params = { ...params, cta: `${ADMIN_URL}/volontaire/${application.youngId}/phase2` };
      } else {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
        params = { ...params, cta: `${ADMIN_URL}/volontaire${application.youngId}/phase2` };
      }
    } else if (template === SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION) {
      // get CC of young
      let cc = [];
      if (young.parent1Email && young.parent1FirstName && young.parent1LastName) cc.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
      if (young.parent2Email && young.parent2FirstName && young.parent2LastName) cc.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      params = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        type_document: `${multipleDocument === "true" ? translateAddFilesPhase2(type) : translateAddFilePhase2(type)}`,
      };
      const sendYoungRPMail = async () => {
        // prevenir jeune / RP
        emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
        params.cta = `${APP_URL}/mission/${application.missionId}`;
        const mail = await sendTemplate(template, {
          emailTo,
          params,
          cc,
        });
        return res.status(200).send({ ok: true, data: mail });
      };
      if (isYoung(req.user)) {
        //second email
        const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
        emailTo = referentManagerPhase2.map((referent) => ({
          name: `${referent.firstName} ${referent.lastName}`,
          email: referent.email,
        }));
        emailTo.push({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email });

        const mail = await sendTemplate(template, {
          emailTo,
          params,
        });
        return res.status(200).send({ ok: true, data: mail });
      } else {
        // envoyer le mail au jeune / RP
        if (req.user.role === ROLES.REFERENT_DEPARTMENT) {
          // prevenir tuteur mission
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          params.cta = `${ADMIN_URL}/volontaire/${application.youngId}/phase2`;

          await sendTemplate(template, {
            emailTo,
            params,
          });

          return sendYoungRPMail();
        } else if (req.user.role === ROLES.RESPONSIBLE) {
          // prevenir referent departement pahse 2
          const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
          emailTo = referentManagerPhase2.map((referent) => ({
            name: `${referent.firstName} ${referent.lastName}`,
            email: referent.email,
          }));
          params.cta = `${ADMIN_URL}/volontaire/${application.youngId}/phase2`;

          await sendTemplate(template, {
            emailTo,
            params,
          });
          return sendYoungRPMail();
        } else if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.REFERENT_REGION) {
          // prevenir tutor
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          params.cta = `${ADMIN_URL}/volontaire/${application.youngId}/phase2`;
          await sendTemplate(template, {
            emailTo,
            params,
          });
          return sendYoungRPMail();
        }
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
        .validate(req.params.key, { stripUnknown: true });
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
          captureMessage("Wrong filetype", { extra: { tempFilePath, mimetype } });
          return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }

        const scanResult = await scanFile(tempFilePath, name, user._id);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
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

      await updateYoungApplicationFilesType(application, req.user);

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
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, ApplicationObject));

module.exports = router;
