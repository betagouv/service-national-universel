import express, { Response } from "express";
import passport from "passport";
import { capture } from "../../sentry";
import { PointDeRassemblementModel } from "../../models";
import { LigneBusModel } from "../../models";
import { CohesionCenterModel } from "../../models";
import { YoungModel } from "../../models";
import { ERRORS } from "../../utils";
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
