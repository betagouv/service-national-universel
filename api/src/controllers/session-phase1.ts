import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import * as datefns from "date-fns";
import { fr } from "date-fns/locale";
import fileUpload from "express-fileupload";
import fs from "fs";
import mongoose from "mongoose";

import { generateBatchCertifPhase1 } from "../templates/certificate/phase1";
import { generateBatchDroitImage } from "../templates/droitImage/droitImage";
import { capture } from "../sentry";
import { SessionPhase1Model, CohesionCenterModel, CohortModel, YoungModel, ReferentModel, LigneBusModel, SessionPhase1Document } from "../models";
import { ERRORS, updatePlacesSessionPhase1, isYoung, uploadFile, deleteFile, getFile, updateHeadCenter } from "../utils";
import {
  ROLES,
  SENDINBLUE_TEMPLATES,
  getCohortStartDate,
  SESSION_FILE_KEYS,
  canViewCohesionCenter,
  isSessionEditionOpen,
  formatDateTimeZone,
  SessionPhase1Type,
  ReferentStatus,
} from "snu-lib";
import { serializeSessionPhase1, serializeCohesionCenter } from "../utils/serializer";
import { validateSessionPhase1Update, validateSessionPhase1Team, validateId } from "../utils/validator";
import { sendTemplate } from "../brevo";
import { config } from "../config";
import { isSessionPhase1InUserScope, getSessionPhase1ScopeFilter } from "../services/sejourAccess";
import { encrypt, decrypt } from "../cryptoUtils";
import { scanFile } from "../utils/virusScanner";
import { getMimeFromFile } from "../utils/file";
import { UserRequest } from "./request";

const router = express.Router();

// Toutes les routes de ce fichier passent par `isSessionPhase1InUserScope` : administrateur, ou
// référent départemental / régional du territoire de la session. Les anciennes gardes
// (`canViewSessionPhase1`, `canCreateOrUpdateSessionPhase1`, `canCreateOrUpdateCohesionCenter`…)
// ne testaient que le rôle : un référent de Guyane lisait et modifiait les sessions des Yvelines,
// et le transporteur, les rôles CLE et les chefs de centre atteignaient toutes les sessions.
// `POST /` a été supprimée : aucun front ne l'appelait, les sessions se créent par
// `PUT /cohesion-center/:id/session-phase1`.

const SESSION_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

router.use("/", require("../sessionPhase1/sessionPhase1Controller"));
router.use("/import", require("../sessionPhase1/import/sessionPhase1ImportController").default);

router.get("/:id/cohesion-center", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user)) {
      if (session._id.toString() !== req.user.sessionPhase1Id?.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else if (!canViewCohesionCenter(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const populatedSession = await populateSessionPhase1(session);

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(populatedSession) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const populateSessionPhase1 = async (session: SessionPhase1Document): Promise<SessionPhase1Type> => {
  const headCenterId = session.headCenterId;
  const adjointsIds = session.adjointsIds;

  const headCenter = await ReferentModel.findById(headCenterId);
  const adjoints = await ReferentModel.find({ _id: { $in: adjointsIds } });

  let populatedSession = session.toObject();

  if (headCenter) {
    const sessionHeadCenter = {
      _id: headCenter._id.toString(),
      firstName: headCenter.firstName,
      lastName: headCenter.lastName,
      email: headCenter.email,
      phone: headCenter.phone,
      mobile: headCenter.mobile,
      role: headCenter.role,
    };
    populatedSession.headCenter = sessionHeadCenter;
  }
  const sessionAdjoints = adjoints.map((adjoint) => ({
    _id: adjoint._id.toString(),
    firstName: adjoint.firstName,
    lastName: adjoint.lastName,
    email: adjoint.email,
    role: adjoint.role,
  }));
  populatedSession.adjoints = sessionAdjoints;
  return populatedSession;
};

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const filter = getSessionPhase1ScopeFilter(req.user);
    if (!filter) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await SessionPhase1Model.find(filter);
    return res.status(200).send({ ok: true, data: data.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isSessionPhase1InUserScope(req.user, sessionPhase1)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const cohort = await CohortModel.findById(sessionPhase1.cohortId);
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Seuls les champs éditables de la session : le centre, la cohorte, le chef de centre, la liste
    // d'attente, les places restantes et l'équipe ont leurs routes dédiées ou sont calculés.
    const { error, value } = validateSessionPhase1Update(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // If session is edition is closed, the contact email can still be updated as long as affectations are not public.
    if (!isSessionEditionOpen(req.user, cohort)) {
      if (cohort?.isAssignmentAnnouncementsOpenForYoung) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      sessionPhase1.sanitaryContactEmail = value.sanitaryContactEmail;
      await sessionPhase1.save({ fromUser: req.user });
      return res.status(200).send({ ok: true, data: serializeSessionPhase1(sessionPhase1) });
    }

    if (!value.dateStart || !value.dateEnd) {
      value.dateStart = undefined;
      value.dateEnd = undefined;
    } else {
      value.dateStart = formatDateTimeZone(value.dateStart);
      value.dateEnd = formatDateTimeZone(value.dateEnd);
    }

    sessionPhase1.set({ ...value });
    await sessionPhase1.save({ fromUser: req.user });

    const data = await updatePlacesSessionPhase1(sessionPhase1, req.user);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/directionTeam", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { error, value: payload } = Joi.object({
      referentId: Joi.string().required(),
      role: Joi.string().valid(ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE).required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isSessionPhase1InUserScope(req.user, sessionPhase1)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const referent = await ReferentModel.findById(payload.referentId);
    if (!referent) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!referent.role || referent.role !== payload.role || ![ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(referent.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (referent.role === ROLES.HEAD_CENTER) {
      let oldHeadCenterId = sessionPhase1.headCenterId;
      sessionPhase1.set({ headCenterId: referent._id });
      await updateHeadCenter(sessionPhase1.headCenterId, req.user);
      await updateHeadCenter(oldHeadCenterId, req.user);
    } else if (referent.role === ROLES.HEAD_CENTER_ADJOINT || referent.role === ROLES.REFERENT_SANITAIRE) {
      if (sessionPhase1.adjointsIds.includes(referent._id)) {
        return res.status(403).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      }
      sessionPhase1.set({ adjointsIds: [...sessionPhase1.adjointsIds, referent._id] });
      referent.set({ cohorts: [...referent.cohorts, sessionPhase1.cohort], cohortIds: [...referent.cohortIds, sessionPhase1.cohortId] });
      await referent.save({ fromUser: req.user });
    }

    await sessionPhase1.save({ fromUser: req.user });
    const populatedSession = await populateSessionPhase1(sessionPhase1);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(populatedSession) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/team", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isSessionPhase1InUserScope(req.user, sessionPhase1)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { error, value } = validateSessionPhase1Team(req.body);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    sessionPhase1.set({ ...value });
    await sessionPhase1.save({ fromUser: req.user });
    const populatedSession = await populateSessionPhase1(sessionPhase1);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(populatedSession) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/certificate", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // `canDownloadYoungDocuments` ne testait que le rôle : n'importe quel responsable de
    // structure ou chef de centre éditait les attestations de toutes les sessions de France.
    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const body = {
      sessionPhase1Id: session._id,
      statusPhase1: "DONE",
    };

    const youngs = await YoungModel.find(body);
    if (!youngs.length) {
      capture("No young found with body: " + JSON.stringify(body));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const cohort = await CohortModel.findById(session.cohortId);
    generateBatchCertifPhase1(res, youngs, session, cohort, cohesionCenter);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const sessionPhase1 = await SessionPhase1Model.findById(id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isSessionPhase1InUserScope(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // check if youngs are registered to the session
    const youngs = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id });
    if (sessionPhase1.placesTotal !== sessionPhase1.placesLeft || youngs.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // Check for existing Plan de Transport
    const lignesDeBus = await LigneBusModel.find({ cohortId: sessionPhase1.cohortId, centerId: sessionPhase1.cohesionCenterId }).select({ _id: 1 });
    if (lignesDeBus.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // delete cohort in cohesion center
    const cohesionCenter = await CohesionCenterModel.findById(sessionPhase1.cohesionCenterId);
    if (!cohesionCenter) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    cohesionCenter.set({
      cohorts: cohesionCenter.cohorts.filter((c) => c !== sessionPhase1.cohort),
      cohortIds: cohesionCenter.cohortIds.filter((c) => c !== sessionPhase1.cohortId),
    });
    await cohesionCenter.save({ fromUser: req.user });

    await sessionPhase1.deleteOne();
    await updateHeadCenter(sessionPhase1.headCenterId, req.user);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Upload a new time schedule file in session (id)
 */
router.post(
  "/:id/:key",
  passport.authenticate(["referent"], { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res: Response) => {
    try {
      // --- validate
      const { error, value } = Joi.object({
        id: Joi.string().alphanum().length(24).required(),
        key: Joi.string()
          .valid(...SESSION_FILE_KEYS)
          .required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { id: sessionId, key } = value;

      // --- rights
      const session = await SessionPhase1Model.findById(sessionId);
      if (!session) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      if (!isSessionPhase1InUserScope(req.user, session)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const files = Object.values(req.files);
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      const { name, tempFilePath, mimetype, size } = file as any;
      // Le type retenu est celui des magic numbers : un fichier au type non reconnu est refusé
      // (il était auparavant enregistré comme PDF), et le mimetype déclaré par le client n'est
      // plus ni stocké ni renvoyé au téléchargement.
      const mimeFromMagicNumbers = await getMimeFromFile(tempFilePath);
      if (!mimeFromMagicNumbers || !SESSION_FILE_TYPES.includes(mimetype) || !SESSION_FILE_TYPES.includes(mimeFromMagicNumbers)) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      const scanResult = await scanFile(tempFilePath, name, req.user._id);
      if (scanResult.infected) {
        return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      const newFile: Partial<SessionPhase1Type["timeScheduleFiles"][0]> = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        size,
        uploadedAt: new Date(),
        mimetype: mimeFromMagicNumbers,
      };
      const data = fs.readFileSync(tempFilePath);
      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
      await uploadFile(`app/session/${sessionId}/${key}/${newFile._id}`, resultingFile);
      fs.unlinkSync(tempFilePath);

      // Add file to session & save
      newFile._id = newFile._id!.toString();
      if (key === "time-schedule") {
        session.timeScheduleFiles.push(newFile);
        session.set("hasTimeSchedule", "true");
      }
      if (key === "pedago-project") {
        session.pedagoProjectFiles.push(newFile);
        session.set("hasPedagoProject", "true");
      }

      await session.save({ fromUser: req.user });
      return res.status(200).send({ session: serializeSessionPhase1(session), data: newFile, ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

/**
 * Delete a time schedule file (fileId) in session (sessionId)
 */
router.delete("/:sessionId/:key/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key, fileId } = value;

    // --- rights
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- remove file
    if (key === "time-schedule") {
      const index = session.timeScheduleFiles ? session.timeScheduleFiles.findIndex((f) => f._id === fileId) : -1;
      if (index < 0) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const [file] = session.timeScheduleFiles.splice(index, 1);
    }
    if (key === "pedago-project") {
      const index = session.pedagoProjectFiles ? session.pedagoProjectFiles.findIndex((f) => f._id === fileId) : -1;
      if (index < 0) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const [file] = session.pedagoProjectFiles.splice(index, 1);
    }
    try {
      await deleteFile(`app/session/${sessionId}/${key}/${fileId}`);
    } catch (err) {
      capture(err);
    }

    // --- save & return
    session.set("hasTimeSchedule", session.timeScheduleFiles.length > 0 ? "true" : "false");
    session.set("hasPedagoProject", session.pedagoProjectFiles.length > 0 ? "true" : "false");

    await session.save({ fromUser: req.user });

    return res.status(200).send({ data: serializeSessionPhase1(session), ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Download a time schedule file (fileId) from session (sessionId).
 */
router.get("/:sessionId/:key/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key, fileId } = value;

    // --- rights
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const file = key === "time-schedule" ? session.timeScheduleFiles.find((f) => f._id === fileId) || null : session.pedagoProjectFiles.find((f) => f._id === fileId) || null;

    if (!file) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- Download from s3
    const downloaded = await getFile(`app/session/${sessionId}/${key}/${fileId}`);
    if (!downloaded) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- Send
    return res.status(200).send({
      data: Buffer.from(decrypt(downloaded.Body), "base64"),
      // Les fichiers antérieurs portent le mimetype déclaré par le client : il n'est renvoyé que s'il
      // fait partie des types acceptés.
      mimeType: file.mimetype && SESSION_FILE_TYPES.includes(file.mimetype) ? file.mimetype : "application/octet-stream",
      fileName: file.name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/:key/send-reminder", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key } = value;

    // --- rights
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- get headCenter
    const headCenter = await ReferentModel.findById(session.headCenterId);
    if (!headCenter || headCenter.status === ReferentStatus.INACTIVE) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (headCenter.email === null || headCenter.email === undefined) {
      return res.status(400).send({ ok: false, code: ERRORS.EMAIL_INVALID });
    }

    // --- send template
    const cohort = await CohortModel.findById(session.cohortId);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    let date = getCohortStartDate(cohort);

    await sendTemplate(SENDINBLUE_TEMPLATES.headCenter.FILE_SESSION_REMINDER, {
      emailTo: [{ email: headCenter.email }],
      params: {
        fileName: key === "time-schedule" ? "l'emploi du temps" : key === "pedago-project" ? "le projet pédagogique" : null,
        date: date ? datefns.format(date, "dd MMMM yyyy", { locale: fr }) : "?",
        cohesioncenter: session.nameCentre,
        cta: `${config.ADMIN_URL}/centre/${session.cohesionCenterId}?sessionId=${session._id}`,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/image-rights/export", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId } = value;
    // --- rights
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    // `canSendImageRightsForSessionPhase1` ne testait que le rôle, sans lien avec la session.
    if (!isSessionPhase1InUserScope(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    // --- found youngs
    const youngs = await YoungModel.find({ sessionPhase1Id: session._id }).sort({ lastName: 1, firstName: 1 });

    generateBatchDroitImage(res, youngs);
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
