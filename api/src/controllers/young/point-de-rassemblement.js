const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const Joi = require("joi");
const { capture } = require("../../sentry");
const { ERRORS, isYoung, isReferent, updateSeatsTakenInBusLine } = require("../../utils");
const { canEditYoung } = require("snu-lib");
const { YoungModel } = require("../../models");
const { LigneBusModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");
const { serializeYoung } = require("../../utils/serializer");
const { validateId } = require("../../utils/validator");
const { isPDRChoiceOpenForYoung } = require("../../services/pointDeRassemblement.service");

router.put("/", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // verify date
    const isOpen = await isPDRChoiceOpenForYoung(req.user);
    if (!isOpen) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // verify data
    const { error, value } = Joi.object({
      meetingPointId: Joi.string().optional(),
      ligneId: Joi.string().optional(),
      deplacementPhase1Autonomous: Joi.string().optional(),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { id, meetingPointId, ligneId, deplacementPhase1Autonomous } = value;

    if (meetingPointId && !ligneId) {
      // si on a meetingPointId, on doit avoir ligneId.
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only update their own meeting points.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    if (isReferent(req.user) && !canEditYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    let bus = null;

    //choosing a meetingPoint
    if (meetingPointId) {
      const meetingPoint = await PointDeRassemblementModel.findById(meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      bus = await LigneBusModel.findById(ligneId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (bus.youngSeatsTaken >= bus.youngCapacity) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    const oldBus = young.ligneId ? await LigneBusModel.findById(young.ligneId) : null;

    young.set({ meetingPointId, ligneId, deplacementPhase1Autonomous, hasMeetingInformation: "true" });
    await young.save({ fromUser: req.user });

    if (bus) {
      await updateSeatsTakenInBusLine(bus);
    }
    if (oldBus) {
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
    // --- params
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
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

    // --- verify young.
    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // --- PDR
    let pdr = await PointDeRassemblementModel.findById(young.meetingPointId);

    let data;

    // --- Bus
    if (withBus) {
      const bus = await LigneBusModel.findById(young.ligneId);
      const ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId, deletedAt: { $exists: false } });
      if (pdr) {
        data = { ...pdr.toObject(), bus, ligneToPoint };
      } else {
        data = { bus, ligneToPoint };
      }
    } else {
      data = pdr.toObject();
    }

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
module.exports = router;
