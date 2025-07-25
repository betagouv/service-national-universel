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
import { YoungDto } from "snu-lib";

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

    const schema = Joi.object({
      busFrom: Joi.string().required(),
      busTo: Joi.string().required(),
      data: Joi.array().items(Joi.object()).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const youngs = req.body.data;
    const ids = youngs.map((e: YoungDto) => e._id);
    const busFrom = await LigneBusModel.findById(req.body.busFrom);
    const busTo = await LigneBusModel.findById(req.body.busTo);
    const youngsDb = await YoungModel.find({ _id: { $in: [...ids] } });
    if (!youngsDb) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const promise = youngs.map(async (e: YoungDto) => {
      const index = youngsDb.findIndex((y) => y._id.toString() === e._id);
      if (index >= 0) {
        Object.keys(e).forEach((key) => (youngsDb[index][key] = e[key]));
        await youngsDb[index].save({ fromUser: req.user });
      }
    });
    await Promise.all(promise);
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
