import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import fs from "fs";
import fileUpload from "express-fileupload";
import mime from "mime-types";

import {
  ROLES,
  SENDINBLUE_TEMPLATES,
  canCreateApplications,
  translateAddFilePhase2,
  translateAddFilesPhase2,
  APPLICATION_STATUS,
  MILITARY_PREPARATION_FILES_STATUS,
  isReadAuthorized,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  isCreateAuthorized,
  isWriteAuthorized,
  isSupervisor,
  isResponsible,
} from "snu-lib";

import { capture, captureMessage } from "../sentry";
import { YoungModel, CohortModel, ReferentModel, ApplicationModel, ContractModel, MissionModel, StructureModel, StructureDocument } from "../models";
import { decrypt, encrypt } from "../cryptoUtils";
import { sendTemplate } from "../brevo";
import { validateUpdateApplication, validateNewApplication, validateId, idSchema } from "../utils/validator";
import { config } from "../config";
import { serializeApplication, serializeYoung, serializeContract } from "../utils/serializer";
import {
  uploadFile,
  ERRORS,
  isYoung,
  isReferent,
  getCcOfYoung,
  updateYoungPhase2StatusAndHours,
  getFile,
  updateYoungStatusPhase2Contract,
  getReferentManagerPhase2,
  updateYoungApplicationFilesType,
} from "../utils";
import { scanFile } from "../utils/virusScanner";
import { getAuthorizationToApply, updateMission } from "../application/applicationService";
import { apiEngagement } from "../services/gouv.fr/api-engagement";
import { getMimeFromBuffer, getMimeFromFile } from "../utils/file";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { accessControlMiddleware } from "../middlewares/accessControlMiddleware";
import {
  notifyReferentMilitaryPreparationFilesSubmitted,
  notifySupervisorMilitaryPreparationFilesValidated,
  notifyReferentNewApplication,
} from "../application/applicationNotificationService";
import { UserRequest } from "../controllers/request";
import patches from "../controllers/patches";
import { logger } from "../logger";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

const { ObjectId } = require("mongoose").Types;

const router = express.Router();

router.post("/:id/change-classement/:rank", passport.authenticate(["young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const JoiId = validateId(req.params.id);
    if (JoiId.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const JoiRank = Joi.string().required().validate(req.params.rank);
    if (JoiRank.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const application = await ApplicationModel.findById(JoiId.value);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungModel.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update his own application.
    if (isYoung(req.user) && application.youngId!.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const allApplications = await ApplicationModel.find({ youngId: young._id.toString() });
    const allApplicationsSorted = allApplications.sort((a, b) => Number(a.priority) - Number(b.priority));
    const currentIndex = allApplicationsSorted.findIndex((app) => app._id.toString() === application._id.toString());

    // on l'enlève de sa position initiale
    allApplicationsSorted.splice(currentIndex, 1);
    // et on l'insère au nouveau rang
    allApplicationsSorted.splice(parseInt(JoiRank.value), 0, application);

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

router.post(
  "/",
  authMiddleware(["young", "referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.CREATE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { value, error } = validateNewApplication(req.body, req.user);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { clickId } = Joi.object({ clickId: Joi.string().optional() }).validate(req.query, { stripUnknown: true }).value;

      if (!("priority" in value)) {
        const applications = await ApplicationModel.find({ youngId: value.youngId });
        value.priority = applications.length + 1;
      }
      const mission = await MissionModel.findById(value.missionId);
      if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // On vérifie si les candidatures sont ouvertes.
      if (mission.visibility === "HIDDEN") {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      value.isJvaMission = mission.isJvaMission;

      const young = await YoungModel.findById(value.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const cohort = await CohortModel.findById(young.cohortId);
      if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (isYoung(req.user)) {
        const { canApply, message } = await getAuthorizationToApply(mission, young, cohort);
        if (!canApply) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED, message });
        }
      }

      // A young can only create their own applications.
      if (!isCreateAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      // - admin can create all applications
      // - referent can create applications of their department/region
      // - responsible and supervisor can create applications of their structures
      if (isReferent(req.user)) {
        if (req.user.role === ROLES.RESPONSIBLE) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          if (value.structureId.toString() !== req.user.structureId.toString()) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
        if (req.user.role === ROLES.SUPERVISOR) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
          if (!structures.map((e) => e._id.toString()).includes(value.structureId.toString())) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
        const cohort = await CohortModel.findById(young.cohortId);
        if (!cohort) {
          return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        }
        if (!canCreateApplications(young, cohort)) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }
      }

      // On vérifie que la candidature n'existe pas déjà en base de donnée.
      const doublon = await ApplicationModel.findOne({ youngId: value.youngId, missionId: value.missionId });
      if (doublon) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      // Send tracking data to API Engagement
      if (mission.apiEngagementId) {
        const data = await apiEngagement.create(value, mission.apiEngagementId, clickId);
        value.apiEngagementId = data?._id;
      }

      value.contractStatus = "DRAFT";
      const data = await ApplicationModel.create(value);
      await updateYoungPhase2StatusAndHours(young, req.user);
      await updateMission(data, req.user);
      await updateYoungStatusPhase2Contract(young, req.user);

      // Update MP status if needed
      const hasSubmittedMilitaryPreparationFiles =
        mission.isMilitaryPreparation === "true" &&
        ![
          MILITARY_PREPARATION_FILES_STATUS.VALIDATED,
          MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION,
          MILITARY_PREPARATION_FILES_STATUS.WAITING_CORRECTION,
          MILITARY_PREPARATION_FILES_STATUS.REFUSED,
        ].includes(young.statusMilitaryPreparationFiles as string);

      if (hasSubmittedMilitaryPreparationFiles) {
        young.set({ statusMilitaryPreparationFiles: MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION });
        await young.save({ fromUser: req.user });
      }
      // Si c'est une préparation militaire, on notifie le referent pour check le dossier eligibilité.
      // Mais pas si c'est une proposition de mission par un référent, seulement si c'est une candidature spontanée.
      if (mission.isMilitaryPreparation === "true" && data.status !== APPLICATION_STATUS.WAITING_ACCEPTATION) {
        await notifyReferentMilitaryPreparationFilesSubmitted(young);
      }

      // Si c'est une préparation militaire et que le dossier PM est déjà validé, on notifie le superviseur de la structure.
      // Mais pas si c'est une proposition de mission par un référent, seulement si c'est une candidature spontanée.
      if (
        mission.isMilitaryPreparation === "true" &&
        young.statusMilitaryPreparationFiles === MILITARY_PREPARATION_FILES_STATUS.VALIDATED &&
        data.status === APPLICATION_STATUS.WAITING_VALIDATION
      ) {
        await notifySupervisorMilitaryPreparationFilesValidated(data);
      }

      // on ne notifie pas le responsable si c'est une candidature proposée par un ref
      if (mission.isMilitaryPreparation !== "true" && value.status !== APPLICATION_STATUS.WAITING_ACCEPTATION) {
        await notifyReferentNewApplication(data, young);
      }

      return res.status(200).send({ ok: true, data: serializeApplication(data) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post(
  "/multiaction/change-status/:key",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
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

      const { error: errorKey, value: valueKey } = Joi.object({
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
      value.ids = value.ids.map((id) => new ObjectId(id));

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

      const applications = await ApplicationModel.aggregate(pipeline).exec();
      if (!applications || applications?.length !== value.ids?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      //check toutes les perms pour chaque application

      // if supervisor store structures --> avoid multiple mongoDb calls
      let structures: StructureDocument[] = [];
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
      }

      for (const application of applications) {
        const young = application.young;
        if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

        // A young can only update his own application.
        // - admin can update all applications
        // - referent can update applications of their department/region
        if (!isWriteAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON(), application: application.toJSON() } })) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
        // - responsible and supervisor can update applications of their structures
        if (req.user.role === ROLES.RESPONSIBLE && (!req.user.structureId || application.structureId.toString() !== req.user.structureId.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
        if (req.user.role === ROLES.SUPERVISOR) {
          if (!req.user.structureId || !structures.map((e) => e._id.toString()).includes(application.structureId.toString())) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
      }

      value.ids.map(async (id: string) => {
        const application = await ApplicationModel.findById(id);
        if (!application) return;

        const young = await YoungModel.findById(application.youngId);

        application.set({ status: valueKey.key });
        await application.save({ fromUser: req.user });

        if (application.apiEngagementId) {
          await apiEngagement.update(application);
        }

        await updateYoungPhase2StatusAndHours(young, req.user);
        await updateYoungStatusPhase2Contract(young, req.user);
        await updateMission(application, req.user);
      });
      res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/",
  authMiddleware(["referent", "young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { value, error } = validateUpdateApplication(req.body, req.user);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const application = await ApplicationModel.findById(value._id);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const young = await YoungModel.findById(application.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const mission = await MissionModel.findById(application.missionId);
      if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // A young can only update his own application.
      if (!isWriteAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON(), application: application.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      // - admin can update all applications
      // - referent can update applications of their department/region
      // - responsible and supervisor can update applications of their structures
      if (isReferent(req.user)) {
        if (req.user.role === ROLES.RESPONSIBLE) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          if (application.structureId!.toString() !== req.user.structureId.toString()) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
        if (req.user.role === ROLES.SUPERVISOR) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
          if (!structures.map((e) => e._id.toString()).includes(application.structureId!.toString())) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
      }

      const originalStatus = application.status;

      application.set(value);

      const youngHasAcceptedAProposedMission =
        originalStatus === APPLICATION_STATUS.WAITING_ACCEPTATION &&
        (application.status === APPLICATION_STATUS.WAITING_VALIDATION || application.status === APPLICATION_STATUS.WAITING_VERIFICATION);

      if (application.isJvaMission === "true") {
        // When a young accepts a mission proposed by a ref, it counts as an application creation in API Engagement
        if (youngHasAcceptedAProposedMission) {
          const mission = await MissionModel.findById(application.missionId);
          if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          const data = await apiEngagement.create(application, mission.apiEngagementId!);
          application.set({ apiEngagementId: data._id });
        } else {
          await apiEngagement.update(application);
        }
      }

      await application.save({ fromUser: req.user });

      await updateYoungPhase2StatusAndHours(young, req.user);
      await updateYoungStatusPhase2Contract(young, req.user);
      await updateMission(application, req.user);

      if (mission.isMilitaryPreparation === "true" && youngHasAcceptedAProposedMission && young.statusMilitaryPreparationFiles !== "VALIDATED") {
        if (!young.statusMilitaryPreparationFiles) {
          young.set({ statusMilitaryPreparationFiles: MILITARY_PREPARATION_FILES_STATUS.WAITING_VERIFICATION });
        }
        await notifyReferentMilitaryPreparationFilesSubmitted(young);
      }

      res.status(200).send({ ok: true, data: serializeApplication(application) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/:id/visibilite",
  authMiddleware(["young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const joiId = validateId(req.params.id);
      if (joiId.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      // const joiBody = validateUpdateApplication(req.body, req.user);
      const joiBody = Joi.object()
        .keys({ hidden: Joi.string().allow(null, "") })
        .validate(req.body, { stripUnknown: true });
      if (joiBody.error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const application = await ApplicationModel.findById(joiId.value);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const young = await YoungModel.findById(application.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // A young can only update his own application.
      if (isWriteAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      application.set({ hidden: joiBody.value.hidden });
      await application.save({ fromUser: req.user });

      res.status(200).send({ ok: true, data: serializeApplication(application) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/contract",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const application = await ApplicationModel.findById(id);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const contract = await ContractModel.findById(application.contractId);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const young = await YoungModel.findById(application.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (!isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.CONTRACT, context: { contract: contract.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      return res.status(200).send({ ok: true, data: serializeContract(contract, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const data = await ApplicationModel.findById(id);
      if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const young = await YoungModel.findById(data.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (!isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { application: data.toJSON(), young: young.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      return res.status(200).send({ ok: true, data: serializeApplication(data) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post(
  "/notify/docs-military-preparation/:template",
  authMiddleware("young"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
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

      const mail = await sendTemplate(template, {
        emailTo: toReferents.map((referent) => ({
          name: `${referent.firstName} ${referent.lastName}`,
          email: referent.email,
        })),
        params: { cta: `${config.ADMIN_URL}/volontaire/${req.user._id}/phase2`, youngFirstName: req.user.firstName, youngLastName: req.user.lastName },
      });
      return res.status(200).send({ ok: true, data: mail });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

type Params = {
  youngFirstName?: string;
  youngLastName?: string;
  missionName?: string;
  cta?: string;
  message?: string;
  firstName?: string;
  lastName?: string;
  type_document?: string;
};

type CC = { name: string; email: string };

router.post(
  "/:id/notify/:template",
  authMiddleware(["referent", "young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
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

      const application = await ApplicationModel.findById(id);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const mission = await MissionModel.findById(application.missionId);
      if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const referent = await ReferentModel.findById(mission.tutorId);
      if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const young = await YoungModel.findById(application.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (!isWriteAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      // - admin can notify for all applications
      // - referent can notify for applications of their department/region
      // - responsible and supervisor can notify for applications of their structures
      if (isReferent(req.user)) {
        if (req.user.role === ROLES.RESPONSIBLE) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          if (application.structureId!.toString() !== req.user.structureId.toString()) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
        if (req.user.role === ROLES.SUPERVISOR) {
          if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
          if (!structures.map((e) => e._id.toString()).includes(application.structureId!.toString())) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
          }
        }
      }

      let template = defaultTemplate;
      let emailTo;
      // build default values for params
      // => young name, and mission name

      let params: Params = { youngFirstName: application.youngFirstName || "", youngLastName: application.youngLastName || "", missionName: mission.name };

      if (template === SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED) {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2/application/${application._id}/contrat` };
      } else if (template === SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION) {
        emailTo = [
          { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail },
          { name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email },
          { name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email },
        ].filter((destinataire) => destinataire.email);
        params = { ...params, cta: `${config.APP_URL}/candidature?utm_campaign=transactionel+mig+candidature+approuvee&utm_source=notifauto&utm_medium=mail+151+faire` };
      } else if (template === SENDINBLUE_TEMPLATES.referent.VALIDATE_APPLICATION_TUTOR) {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
        params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}` };
      } else if (template === SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION) {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
      } else if (template === SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION) {
        emailTo = [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }];
      } else if (template === SENDINBLUE_TEMPLATES.referent.ABANDON_APPLICATION) {
        emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
      } else if (template === SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION) {
        emailTo = [
          { name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail },
          { name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email },
          { name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email },
        ].filter((destinataire) => destinataire.email);
        params = {
          ...params,
          message,
          cta: `${config.APP_URL}/mission?utm_campaign=transactionnel+mig+candidature+nonretenue&utm_source=notifauto&utm_medium=mail+152+candidater`,
        };
      } else if (template === SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION) {
        // when it is a new application, there are 2 possibilities
        if (mission.isMilitaryPreparation === "true") {
          if (young.statusMilitaryPreparationFiles === "VALIDATED") {
            emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
            template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED;
            params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
          } else {
            const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
            emailTo = referentManagerPhase2.map((referent) => ({
              name: `${referent.firstName} ${referent.lastName}`,
              email: referent.email,
            }));
            template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_SUBMITTED;
            params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
          }
        } else {
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
          params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
        }
      } else if (template === SENDINBLUE_TEMPLATES.referent.RELANCE_APPLICATION) {
        // when it is a new application, there are 2 possibilities
        if (mission.isMilitaryPreparation === "true") {
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          template = SENDINBLUE_TEMPLATES.referent.MILITARY_PREPARATION_DOCS_VALIDATED;
          params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
        } else {
          emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
          template = SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION_MIG;
          params = { ...params, cta: `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2` };
        }
      } else if (template === SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION) {
        // get CC of young
        let cc: CC[] = [];
        if (young.parent1Email && young.parent1FirstName && young.parent1LastName)
          cc.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
        if (young.parent2Email && young.parent2FirstName && young.parent2LastName)
          cc.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
        params = {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          type_document: `${multipleDocument === "true" ? translateAddFilesPhase2(type) : translateAddFilePhase2(type)}`,
        };
        const sendYoungRPMail = async () => {
          // prevenir jeune / RP
          emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
          params.cta = `${config.APP_URL}/mission/${application.missionId}`;
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
            params.cta = `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2`;

            await sendTemplate(template, {
              emailTo,
              params,
            });

            return sendYoungRPMail();
          } else if (isResponsible(req.user) || isSupervisor(req.user)) {
            // prevenir referent departement pahse 2
            const referentManagerPhase2 = await getReferentManagerPhase2(application.youngDepartment);
            emailTo = referentManagerPhase2.map((referent) => ({
              name: `${referent.firstName} ${referent.lastName}`,
              email: referent.email,
            }));
            params.cta = `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2`;

            await sendTemplate(template, {
              emailTo,
              params,
            });
            return sendYoungRPMail();
          } else if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.REFERENT_REGION) {
            // prevenir tutor
            emailTo = [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }];
            params.cta = `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2`;
            await sendTemplate(template, {
              emailTo,
              params,
            });
            return sendYoungRPMail();
          } else {
            emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
          }
        }
      } else {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      let cc = isYoung(req.user) ? getCcOfYoung({ template, young }) : [];
      logger.info(`Sending email to ${emailTo?.map((destinataire) => destinataire.email).join(", ")} with template ${template}`);
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
  },
);

router.post(
  "/:id/file/:key",
  authMiddleware(["referent", "young"]),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res: Response) => {
    try {
      const application = await ApplicationModel.findById(req.params.id);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.APPLICATION_NOT_FOUND });

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
      const user = await YoungModel.findById(application.youngId);
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
      //const application = await ApplicationModel.find({ youngId: req.user._id });
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.APPLICATION_NOT_FOUND });

      for (let i = 0; i < files.length; i++) {
        let currentFile = files[i];
        // If multiple file with same names are provided, currentFile is an array. We just take the latest.
        if (Array.isArray(currentFile)) {
          currentFile = currentFile[currentFile.length - 1];
        }
        const { name, tempFilePath, mimetype } = currentFile;
        const mimeFromMagicNumbers = await getMimeFromFile(tempFilePath);
        if (!mimeFromMagicNumbers) {
          return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
        }

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

router.get("/:id/file/:key/:name", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

    const application = await ApplicationModel.findById(id);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const young = await YoungModel.findById(application.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== young?._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const downloaded = await getFile(`app/young/${young._id}/application/${key}/${name}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile: any = null;
    try {
      mimeFromFile = await getMimeFromBuffer(decryptedBuffer);
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

router.get(
  "/:id/patches",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN]),
  ],
  async (req: UserRequest, res: Response) => {
    try {
      const { id } = req.params;

      const application = await ApplicationModel.findById(id);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const applicationPatches = await patches.get(req, ApplicationModel);
      if (!applicationPatches) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data: applicationPatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

module.exports = router;
