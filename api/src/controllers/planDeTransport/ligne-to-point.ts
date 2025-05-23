import express, { Response } from "express";
import passport from "passport";
import { LigneToPointModel } from "../../models";
import { PointDeRassemblementModel } from "../../models";
import { LigneBusModel } from "../../models";
import { PlanTransportModel } from "../../models";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { capture } from "../../sentry";
import Joi from "joi";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

const router = express.Router();

router.get(
  "/meeting-point/:meetingPointId",
  authMiddleware("referent"),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.LIGNE_BUS, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        meetingPointId: Joi.string().length(24).hex().required(),
      }).validate(req.params);

      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { meetingPointId } = value;

      const ligneToPoint = await LigneToPointModel.findOne({ meetingPointId });
      if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const meetingPoint = await PointDeRassemblementModel.findById(meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const data = { ...ligneToPoint._doc, meetingPoint };

      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = validateId(req.params.id);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (req.user.role !== "admin") return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const id = value.toString();

    const ligneToPoint = await LigneToPointModel.findById(id);
    if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    ligneToPoint.set({ deletedAt: new Date() });
    await ligneToPoint.save({ fromUser: req.user });

    const ligne = await LigneBusModel.findById(ligneToPoint.lineId);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const meetingPoint = await PointDeRassemblementModel.findById(ligneToPoint.meetingPointId);
    if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    ligne.set({ meetingPointsIds: ligne.meetingPointsIds.filter((id) => id !== meetingPoint._id.toString()) });
    await ligne.save({ fromUser: req.user });

    // * Update slave PlanTransport
    const planDeTransport = await PlanTransportModel.findById(ligneToPoint.lineId);
    if (!planDeTransport) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // @ts-ignore
    planDeTransport.pointDeRassemblements = planDeTransport.pointDeRassemblements.filter((p) => p.meetingPointId.toString() !== meetingPoint._id.toString());
    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    return res.status(200).send({ ok: true, data: { ligne, ligneToPoint } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
