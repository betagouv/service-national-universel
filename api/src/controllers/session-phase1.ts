import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import * as datefns from "date-fns";
import { fr } from "date-fns/locale";

import { generateBatchCertifPhase1 } from "../templates/certificate/phase1";
import { generateBatchDroitImage } from "../templates/droitImage/droitImage";
import { capture } from "../sentry";
import { SessionPhase1Model, CohesionCenterModel, CohortModel, YoungModel, ReferentModel, SessionPhase1Document } from "../models";
import { ERRORS, isYoung, getFile } from "../utils";
import { SENDINBLUE_TEMPLATES, getCohortStartDate, SESSION_FILE_KEYS, canViewCohesionCenter, SessionPhase1Type, ReferentStatus } from "snu-lib";
import { serializeSessionPhase1, serializeCohesionCenter } from "../utils/serializer";
import { validateId } from "../utils/validator";
import { sendTemplate } from "../brevo";
import { config } from "../config";
import { isSessionPhase1InUserScope, getSessionPhase1ScopeFilter } from "../services/sejourAccess";
import { decrypt } from "../cryptoUtils";
import { UserRequest } from "./request";

const router = express.Router();

// Toutes les routes de ce fichier passent par `isSessionPhase1InUserScope` : administrateur, ou
// référent départemental / régional du territoire de la session. Les anciennes gardes
// (`canViewSessionPhase1`, `canCreateOrUpdateSessionPhase1`, `canCreateOrUpdateCohesionCenter`…)
// ne testaient que le rôle : un référent de Guyane lisait et modifiait les sessions des Yvelines,
// et le transporteur, les rôles CLE et les chefs de centre atteignaient toutes les sessions.
// `POST /` a été supprimée : aucun front ne l'appelait.
// Les écritures (modification, équipes, suppression, fichiers, import) ont été supprimées le 2026-09-24 :
// plus aucune création ni modification de la phase 1 (sessions, centres, transport) n'est possible.

const SESSION_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

router.use("/", require("../sessionPhase1/sessionPhase1Controller"));

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

    // PM14 (25/09/2026, résiduel de M59) : sans req.user, isYoung(undefined) est toujours faux —
    // waitingList (identifiants d'autres volontaires) n'était jamais retiré pour un jeune.
    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter, req.user) });
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
