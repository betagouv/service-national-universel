const express = require("express");
const router = express.Router();
const passport = require("passport");
const { LigneToPointModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");
const { LigneBusModel } = require("../../models");
const { PlanTransportModel } = require("../../models");
const { canViewLigneBus } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");
const { capture } = require("../../sentry");
const Joi = require("joi");

router.get("/meeting-point/:meetingPointId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      meetingPointId: Joi.string().length(24).hex().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (req.user.role !== "admin") return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

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
    planDeTransport.pointDeRassemblements = planDeTransport.pointDeRassemblements.filter((p) => p.meetingPointId.toString() !== meetingPoint._id.toString());
    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    return res.status(200).send({ ok: true, data: { ligne, ligneToPoint } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
