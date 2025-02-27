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

import { config } from "../../config";
import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { YoungModel, SessionPhase1Model, PointDeRassemblementModel, LigneBusModel, CohortModel } from "../../models";
import { ERRORS, updatePlacesSessionPhase1, updateSeatsTakenInBusLine, autoValidationSessionPhase1Young, getCcOfYoung } from "../../utils";
import { serializeYoung, serializeSessionPhase1 } from "../../utils/serializer";
import { UserRequest } from "../request";
import { getCompletionObjectifs } from "../../services/inscription-goal";
import { handleNotificationForDeparture } from "../../young/youngService";

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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
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
      bus = await LigneBusModel.findById(ligneId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const isFull = bus.youngCapacity - bus.youngSeatsTaken <= 0;
      if (isFull) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const oldBus = young.ligneId ? await LigneBusModel.findById(young.ligneId) : null;

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
    if (cohort?.isAssignmentAnnouncementsOpenForYoung) {
      const cohortPeriod = getCohortPeriod(cohort);
      let template = SENDINBLUE_TEMPLATES.young.PHASE1_AFFECTATION;
      let emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
      let params = { cohortPeriod: cohortPeriod };
      let cc = getCcOfYoung({ template, young });
      await sendTemplate(template, { emailTo, params, cc });
    }

    await young.save({ fromUser: req.user });

    // update session infos
    const data = await updatePlacesSessionPhase1(session, req.user);
    if (oldSession) await updatePlacesSessionPhase1(oldSession, req.user);

    //update Bus infos
    if (bus) await updateSeatsTakenInBusLine(bus);
    if (oldBus) await updateSeatsTakenInBusLine(oldBus);

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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const { departSejourMotif, departSejourAt, departSejourMotifComment, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt, departSejourMotif, departSejourMotifComment, departInform: "true" });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, user: req.user });

    await handleNotificationForDeparture(young, departSejourMotif, departSejourMotifComment);

    res.status(200).send({ ok: true, data: serializeYoung(young) });
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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt: undefined, departSejourMotif: undefined, departSejourMotifComment: undefined, departInform: undefined });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, user: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const allowedKeys = ["cohesionStayPresence", "presenceJDM", "cohesionStayMedicalFileReceived", "youngPhase1Agreement", "isTravelingByPlane"];
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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    const { value: newValue, key, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if ((key === "cohesionStayPresence" || key === "presenceJDM" || key === "isTravelingByPlane") && newValue == "") {
      young[key] = undefined;
    } else {
      young.set({ [key]: newValue });
    }

    await young.save({ fromUser: req.user });

    if (!["youngPhase1Agreement", "isTravelingByPlane"].includes(key)) {
      const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
      if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      await autoValidationSessionPhase1Young({ young, sessionPhase1, user: req.user });
      await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    if (key === "cohesionStayPresence" && newValue === "true") {
      let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email! }];
      if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
        emailTo,
        params: {
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
      });
    }

    // uniquement post affectation
    if (key === "youngPhase1Agreement" && newValue === "true") {
      let template = SENDINBLUE_TEMPLATES.young.PHASE1_AGREEMENT;
      let cc = getCcOfYoung({ template, young });
      const cohort = await CohortModel.findOne({ name: young.cohort });
      await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: `${config.APP_URL}`,
          date_cohorte: cohort ? getCohortPeriod(cohort) : "",
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
        cc,
      });
    }

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
