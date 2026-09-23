import express, { Response } from "express";
import passport from "passport";
import { capture } from "../../sentry";
import Joi from "joi";
import { PointDeRassemblementModel } from "../../models";
import { LigneBusModel } from "../../models";
import { CohesionCenterModel } from "../../models";
import { YoungModel } from "../../models";
import { ERRORS, updateSeatsTakenInBusLine } from "../../utils";
import { UserRequest } from "../request";

const router = express.Router();

router.post("/youngs/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { ligneIds, cohort } = req.body;
    const youngs = await YoungModel.find({ ligneId: { $in: [...ligneIds] } }, "_id firstName lastName ligneId meetingPointId cohort status sessionPhase1Id cohensioncenterId");
    if (!youngs || !youngs.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({
      ok: true,
      data: youngs.filter((e) => {
        return e.cohort === cohort && e.status === "VALIDATED";
      }),
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/meetingPoints", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: [...req.body] }, deletedAt: { $exists: false } });
    if (!meetingPoints || !meetingPoints.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    res.status(200).send({ ok: true, data: meetingPoints });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/saveYoungs", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Seuls les champs d'affectation au transport sont modifiables : le corps était
    // auparavant recopié tel quel sur le document Young (tout champ du modèle).
    const schema = Joi.object({
      busFrom: Joi.string().hex().length(24).required(),
      busTo: Joi.string().hex().length(24).required(),
      data: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string().hex().length(24).required(),
            ligneId: Joi.string().hex().length(24).required(),
            meetingPointId: Joi.string().hex().length(24).required(),
            sessionPhase1Id: Joi.string().allow(null, ""),
          }),
        )
        .required(),
    });
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const busFrom = await LigneBusModel.findById(value.busFrom);
    const busTo = await LigneBusModel.findById(value.busTo);
    if (!busFrom || !busTo) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Chaque jeune doit être transféré vers busTo, sur l'un de ses points de rassemblement
    // et sur sa session : on n'écrit jamais une affectation arbitraire.
    const busToId = busTo._id.toString();
    const busToMeetingPointIds = (busTo.meetingPointsIds || []).map(String);
    const youngs = value.data;
    const isValidTransfer = youngs.every(
      (young) =>
        young.ligneId === busToId && busToMeetingPointIds.includes(young.meetingPointId) && (young.sessionPhase1Id || null) === (busTo.sessionId ? String(busTo.sessionId) : null),
    );
    if (!isValidTransfer) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    // Seuls les jeunes effectivement rattachés à busFrom peuvent être déplacés.
    const ids = [...new Set(youngs.map((young) => young._id))];
    const youngsDb = await YoungModel.find({ _id: { $in: ids }, ligneId: busFrom._id.toString() });
    if (youngsDb.length !== ids.length) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    for (const youngDb of youngsDb) {
      const young = youngs.find((y) => y._id === youngDb._id.toString());
      youngDb.set({ ligneId: young.ligneId, meetingPointId: young.meetingPointId, sessionPhase1Id: young.sessionPhase1Id });
      await youngDb.save({ fromUser: req.user });
    }
    await updateSeatsTakenInBusLine(busFrom);
    await updateSeatsTakenInBusLine(busTo);
    res.status(200).send({ ok: true, data: youngs });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/allLines/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { cohort } = req.params;
    let lines = await LigneBusModel.find({ cohort: cohort }, "_id busId centerId youngCapacity meetingPointsIds sessionId").lean();
    if (!lines) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = lines.map(async (e) => {
      const center = await CohesionCenterModel.findById(e.centerId);
      if (!center) return { ...e, region: "", cohensioncenterId: "" };
      return { ...e, region: center.region, cohensioncenterId: center._id };
    });
    const response = await Promise.all(data);
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
