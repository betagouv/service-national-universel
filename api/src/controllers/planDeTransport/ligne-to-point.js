const express = require("express");
const router = express.Router();
const passport = require("passport");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const { canViewLigneBus } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");

router.get("/meeting-point/:meetingPointId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      meetingPointId: Joi.string().required(),
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

module.exports = router;
