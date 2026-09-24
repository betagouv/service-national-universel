const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const Joi = require("joi");
const { capture } = require("../../sentry");
const { ERRORS, updateSeatsTakenInBusLine } = require("../../utils");
const { LigneBusModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");
const { serializeYoung } = require("../../utils/serializer");
const { isPDRChoiceOpenForYoung } = require("../../services/pointDeRassemblement.service");
const { reserveBusLineSeat, resyncBusLineSeats } = require("../../utils/placeReservation");

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

router.put("/", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // verify date
    const isOpen = await isPDRChoiceOpenForYoung(req.user);
    if (!isOpen) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // verify data
    // meetingPointId et ligneId vont ensemble : un ligneId seul contournait le contrôle de capacité de la ligne (constat M57).
    const { error, value } = Joi.object({
      meetingPointId: Joi.string().optional(),
      ligneId: Joi.string().optional(),
      deplacementPhase1Autonomous: Joi.string().optional(),
      id: Joi.string().required(),
    })
      .and("meetingPointId", "ligneId")
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { meetingPointId, ligneId, deplacementPhase1Autonomous } = value;

    // Appartenance contrôlée par youngPerimeterMiddleware (monté sur /young/:id/point-de-rassemblement).
    const young = req.targetYoung;

    let bus = null;

    //choosing a meetingPoint
    if (meetingPointId) {
      const meetingPoint = await PointDeRassemblementModel.findOne({ _id: meetingPointId, deletedAt: { $exists: false } });
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const ligne = await LigneBusModel.findById(ligneId);
      if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      // La ligne doit desservir ce point et appartenir à la cohorte et à la session du jeune.
      const ligneToPoint = await LigneToPointModel.findOne({ lineId: ligneId, meetingPointId, deletedAt: { $exists: false } });
      if (!ligneToPoint || ligne.cohort !== young.cohort || ligne.sessionId !== young.sessionPhase1Id) {
        return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      // Réservation atomique d'une place (constat L25) : le jeune n'est écrit qu'en cas de succès.
      bus = await reserveBusLineSeat(ligneId);
      if (!bus) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    const oldBus = young.ligneId ? await LigneBusModel.findById(young.ligneId) : null;

    young.set({ meetingPointId, ligneId, deplacementPhase1Autonomous, hasMeetingInformation: "true" });
    try {
      await young.save({ fromUser: req.user });
    } catch (e) {
      if (bus) await resyncBusLineSeats(ligneId);
      throw e;
    }

    // Recomptage : réaligne les compteurs sur les jeunes réellement affectés (dont une réservation faite pour un jeune déjà sur la ligne).
    if (bus) {
      await updateSeatsTakenInBusLine(bus);
    }
    if (oldBus && oldBus._id.toString() !== bus?._id.toString()) {
      await updateSeatsTakenInBusLine(oldBus);
    }
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

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
