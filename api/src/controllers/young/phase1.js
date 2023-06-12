/**
 * /young/phase1
 *
 * ROUTES
 *   POST  /young/:youngId/phase1/dispense        -> Passe le statut d'un jeune en dispensé
 */

const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const { canEditPresenceYoung, ROLES, canAssignManually, SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const SessionPhase1Model = require("../../models/sessionPhase1");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const CohortModel = require("../../models/cohort");
const { ERRORS, autoValidationSessionPhase1Young, updatePlacesSessionPhase1, updateSeatsTakenInBusLine } = require("../../utils");
const { serializeYoung, serializeSessionPhase1 } = require("../../utils/serializer");
const { sendTemplate } = require("../../sendinblue");

router.post("/affectation", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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
    if (!canEditPresenceYoung(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (young.status === YOUNG_STATUS.WITHDRAWN) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // verification nombre de place ?
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // mail only if isAssignmentAnnouncementsOpenForYoung
    const cohort = await CohortModel.findOne({ name: session.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canAssignManually(req.user, young, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const oldSession = young.sessionPhase1Id ? await SessionPhase1Model.findById(young.sessionPhase1Id) : null;

    let bus = null;
    if (meetingPointId) {
      const meetingPoint = await PointDeRassemblementModel.findById(meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      bus = await LigneBusModel.findById(ligneId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const oldBus = young.ligneId ? await LigneBusModel.findById(young.ligneId) : null;

    // update youngs infos
    if (young.status === "WAITING_LIST") {
      young.set({ status: "VALIDATED" });
    }

    young.set({
      statusPhase1: "AFFECTED",
      sessionPhase1Id: sessionId,
      cohesionCenterId: centerId,
      deplacementPhase1Autonomous: pdrOption === "self-going" ? "true" : "false",
      transportInfoGivenByLocal: pdrOption === "local" ? "true" : "false",
      meetingPointId: meetingPointId ? meetingPointId : undefined,
      ligneId: ligneId ? ligneId : undefined,
      hasMeetingInformation: pdrOption !== "young-select" ? "true" : "false",
    });

    if (cohort?.isAssignmentAnnouncementsOpenForYoung) {
      let emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
      await sendTemplate(SENDINBLUE_TEMPLATES.young.PHASE1_AFFECTATION, { emailTo });
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
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/dispense", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

    if (!canEditPresenceYoung(req.user, young)) {
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

router.post("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

    if (!canEditPresenceYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt, departSejourMotif, departSejourMotifComment, departInform: "true" });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, req });

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

    if (!canEditPresenceYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt: undefined, departSejourMotif: undefined, departSejourMotifComment: undefined, departInform: undefined });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, req });

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

    if (!canEditPresenceYoung(req.user, young)) {
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
      await autoValidationSessionPhase1Young({ young, sessionPhase1, req });
      await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    if (key === "cohesionStayPresence" && newValue === "true") {
      let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }];
      if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
        emailTo,
        params: {
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
      });
    }

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
