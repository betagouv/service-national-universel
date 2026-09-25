const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const Joi = require("joi");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { LigneBusModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");

/**
 * Le tableau `team` d'une ligne de bus contient l'identité, la date de naissance, l'email et le
 * téléphone des accompagnateurs : ces données n'ont pas à être renvoyées au volontaire (constat H48).
 */
function serializeLigneBusForYoung(bus) {
  if (!bus) return bus;
  return bus.toObject({
    transform: (_doc, ret) => {
      delete ret.team;
      return ret;
    },
  });
}

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- query
    const { error: queryError, value } = Joi.object({
      withbus: Joi.string().valid("true").optional(),
    })
      .unknown()
      .validate({ ...req.query }, { stripUnknown: true });
    if (queryError) {
      capture(queryError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const withBus = value.withbus === "true";

    // --- verify young. (appartenance contrôlée par youngPerimeterMiddleware)
    const young = req.targetYoung;

    // --- PDR
    let pdr = await PointDeRassemblementModel.findById(young.meetingPointId);

    let data;

    // --- Bus
    if (withBus) {
      const bus = await LigneBusModel.findById(young.ligneId);
      const ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId, deletedAt: { $exists: false } });
      if (pdr) {
        data = { ...pdr.toObject(), bus: serializeLigneBusForYoung(bus), ligneToPoint };
      } else {
        data = { bus: serializeLigneBusForYoung(bus), ligneToPoint };
      }
    } else {
      data = pdr ? pdr.toObject() : null;
    }

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
module.exports = router;
