/**
 * /young/phase1
 *
 * ROUTES
 *   POST  /young/:youngId/phase1/dispense        -> Passe le statut d'un jeune en dispensé
 */

import express from "express";
import passport from "passport";
import Joi from "joi";
import {
  canEditPresenceYoung,
  ROLES,
  canAssignManually,
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  getDepartmentForInscriptionGoal,
  FUNCTIONAL_ERRORS,
  LigneBusType,
  getCohortPeriod,
} from "snu-lib";

import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { YoungModel, SessionPhase1Model, SessionPhase1Document, PointDeRassemblementModel, LigneBusModel, CohortModel } from "../../models";
import { ERRORS, updatePlacesSessionPhase1, updateSeatsTakenInBusLine, getCcOfYoung } from "../../utils";
import { serializeYoung, serializeSessionPhase1 } from "../../utils/serializer";
import { reserveSessionPhase1Places, resyncSessionPhase1Places, reserveBusLineSeat, resyncBusLineSeats } from "../../utils/placeReservation";
import { UserRequest } from "../request";
import { getCompletionObjectifs } from "../../services/inscription-goal";
import { handleNotificationForDeparture } from "../../young/youngService";
import { autoValidationSessionPhase1Young } from "../../sessionPhase1/validation/sessionPhase1ValidationService";
import { notifyJeuneConfirmationParticipationWasUpdated, notifyParentsPresenceArriveeWasValidated } from "../../sessionPhase1/notification/sessionPhase1NotificationService";

const router = express.Router({ mergeParams: true });

router.post("/affectation", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const allowedKeys = ["self-going", "ref-select", "young-select", "local"];
    const { error, value } = Joi.object({
      centerId: Joi.string().required(),
      sessionId: Joi.string().required(),
      meetingPointId: Joi.string().optional().allow(null, ""),
      ligneId: Joi.string().optional().allow(null, ""),
      id: Joi.string().required(),
      pdrOption: Joi.string()
        .trim()
        .required()
        .valid(...allowedKeys),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { id, sessionId, centerId, meetingPointId, pdrOption, ligneId } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // check if referent is allowed to edit this young --> Todo with cohort
    if (!canEditPresenceYoung(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (young.status === YOUNG_STATUS.WITHDRAWN) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // verification nombre de place ?
    const youngIsChangingSession = sessionId && young.sessionPhase1Id !== sessionId;
    const youngIsChangingCenter = centerId && young.cohesionCenterId !== centerId;

    if (youngIsChangingSession || youngIsChangingCenter) {
      const isFull = !session.placesLeft || session.placesLeft <= 0;
      if (isFull) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // mail only if isAssignmentAnnouncementsOpenForYoung
    const cohort = await CohortModel.findOne({ name: session.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canAssignManually(req.user, young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const oldSession = young.sessionPhase1Id ? await SessionPhase1Model.findById(young.sessionPhase1Id) : null;

    let bus: LigneBusType | null = null;
    if (meetingPointId) {
      const meetingPoint = await PointDeRassemblementModel.findOne({ _id: meetingPointId });
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (ligneId) {
      const ligne = await LigneBusModel.findById(ligneId);
      if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const oldBus = young.ligneId ? await LigneBusModel.findById(young.ligneId) : null;
    // Le jeune déjà compté sur cette ligne (changement de point sur la même ligne) garde son siège.
    const youngAlreadyHoldsSeat =
      !!ligneId &&
      young.ligneId === ligneId &&
      young.status === YOUNG_STATUS.VALIDATED &&
      ([YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE] as string[]).includes(young.statusPhase1);

    // update youngs infos
    if (young.status === "WAITING_LIST") {
      const departement = getDepartmentForInscriptionGoal(young);
      const completionObjectif = await getCompletionObjectifs(departement, cohort);
      if (completionObjectif.isAtteint) {
        return res.status(400).send({
          ok: false,
          code: completionObjectif.region.isAtteint ? FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED : FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REACHED,
        });
      }
      young.set({ status: "VALIDATED" });
    }

    // Réservation atomique des places (constat L25) : session puis ligne, le jeune n'est écrit
    // qu'une fois les deux réservations obtenues ; en cas d'échec, les compteurs déjà réservés sont recalculés.
    let reservedSession: SessionPhase1Document | null = null;
    if (youngIsChangingSession || youngIsChangingCenter) {
      reservedSession = await reserveSessionPhase1Places(sessionId);
      if (!reservedSession) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (ligneId && !youngAlreadyHoldsSeat) {
      bus = await reserveBusLineSeat(ligneId);
      if (!bus) {
        if (reservedSession) await resyncSessionPhase1Places(sessionId, req.user);
        return res.status(409).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    const resyncReservations = async () => {
      if (reservedSession) await resyncSessionPhase1Places(sessionId, req.user);
      if (bus) await resyncBusLineSeats(ligneId);
    };

    if (([YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE1.AFFECTED] as string[]).includes(young.statusPhase1)) {
      young.set({ statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED });
    }

    young.set({
      sessionPhase1Id: sessionId,
      cohesionCenterId: centerId,
      deplacementPhase1Autonomous: pdrOption === "self-going" ? "true" : "false",
      transportInfoGivenByLocal: pdrOption === "local" ? "true" : "false",
      meetingPointId: meetingPointId ? meetingPointId : undefined,
      ligneId: ligneId ? ligneId : undefined,
      hasMeetingInformation: pdrOption !== "young-select" ? "true" : "false",
    });
    try {
      if (cohort?.isAssignmentAnnouncementsOpenForYoung) {
        const cohortPeriod = getCohortPeriod(cohort);
        let template = SENDINBLUE_TEMPLATES.young.PHASE1_AFFECTATION;
        let emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
        let params = { cohortPeriod: cohortPeriod };
        let cc = getCcOfYoung({ template, young });
        await sendTemplate(template, { emailTo, params, cc });
      }

      await young.save({ fromUser: req.user });
    } catch (e) {
      await resyncReservations();
      throw e;
    }

    // update session infos (recomptage : réaligne les compteurs sur les jeunes réellement affectés)
    const data = await updatePlacesSessionPhase1(reservedSession ?? session, req.user);
    if (oldSession && oldSession._id.toString() !== session._id.toString()) await updatePlacesSessionPhase1(oldSession, req.user);

    //update Bus infos
    if (bus) await updateSeatsTakenInBusLine(bus);
    if (oldBus && oldBus._id.toString() !== bus?._id.toString()) await updateSeatsTakenInBusLine(oldBus);

    return res.status(200).send({
      data: serializeSessionPhase1(data, req.user),
      young: serializeYoung(young, req.user),
      ok: true,
    });
  } catch (error) {
    capture(error);
    if (Object.keys(FUNCTIONAL_ERRORS).includes(error.message)) {
      res.status(400).send({ ok: false, code: error.message });
    } else {
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
});

router.post("/dispense", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      statusPhase1MotifDetail: Joi.string().required(),
      statusPhase1Motif: Joi.string().required(),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { statusPhase1MotifDetail, statusPhase1Motif, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    // passage en dispensé unqiuement si séjour non réalisé
    if (req.user.role !== ROLES.ADMIN && young.statusPhase1 !== "NOT_DONE") return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({ statusPhase1MotifDetail, statusPhase1Motif, statusPhase1: "EXEMPTED" });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ data: serializeYoung(young, req.user), ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      departSejourMotif: Joi.string().required(),
      departSejourAt: Joi.string().required(),
      departSejourMotifComment: Joi.string().optional().allow(null, ""),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { departSejourMotif, departSejourAt, departSejourMotifComment, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt, departSejourMotif, departSejourMotifComment, departInform: "true" });
    await young.save({ fromUser: req.user });

    await autoValidationSessionPhase1Young({ young, user: req.user });

    await handleNotificationForDeparture(young, departSejourMotif, departSejourMotifComment);

    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt: undefined, departSejourMotif: undefined, departSejourMotifComment: undefined, departInform: undefined });
    await young.save({ fromUser: req.user });

    await autoValidationSessionPhase1Young({ young, user: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const PHASE_1_KEYS = {
  COHESION_STAY_PRESENCE: "cohesionStayPresence",
  PRESENCE_JDM: "presenceJDM",
  COHESION_STAY_MEDICAL_FILE_RECEIVED: "cohesionStayMedicalFileReceived",
  YOUNG_PHASE_1_AGREEMENT: "youngPhase1Agreement",
  IS_TRAVELING_BY_PLANE: "isTravelingByPlane",
};

router.post("/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const allowedKeys = Object.values(PHASE_1_KEYS);
    const { error, value } = Joi.object({
      value: Joi.string().trim().valid("true", "false", "").required(),
      key: Joi.string()
        .trim()
        .required()
        .valid(...allowedKeys),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { value: newValue, key, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if ((key === PHASE_1_KEYS.COHESION_STAY_PRESENCE || key === PHASE_1_KEYS.PRESENCE_JDM || key === PHASE_1_KEYS.IS_TRAVELING_BY_PLANE) && newValue == "") {
      young[key] = undefined;
    } else {
      young.set({ [key]: newValue });
    }

    const data = await young.save({ fromUser: req.user });

    // Side effects

    const wasPresenceArriveeUpdated = key === PHASE_1_KEYS.COHESION_STAY_PRESENCE && (newValue === "true" || newValue === "false");

    const wasConfirmationParticipationValidated = key === PHASE_1_KEYS.YOUNG_PHASE_1_AGREEMENT && newValue === "true";

    if (wasPresenceArriveeUpdated) {
      const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
      if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      await autoValidationSessionPhase1Young({ young, user: req.user });
      await updatePlacesSessionPhase1(sessionPhase1, req.user);
      if (newValue === "true") {
        await notifyParentsPresenceArriveeWasValidated(young);
      }
    }

    // uniquement post affectation
    if (wasConfirmationParticipationValidated) {
      await notifyJeuneConfirmationParticipationWasUpdated(young);
    }

    res.status(200).send({ ok: true, data: serializeYoung(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
