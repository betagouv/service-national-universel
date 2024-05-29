const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const passport = require("passport");

const { canViewLigneBus } = require("snu-lib");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { LigneBusModel, PlanTransportModel } = require("../../models");

const { getInfoBus, syncMergedBus } = require("./ligneDeBusService");

// Ajout d'une ligne fusionnée
router.post("/:id/ligne-fusionnee", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // check params
    const { value: params, error: paramsError } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);
    // check payload
    if (paramsError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { value: payload, error: payloadError } = Joi.object({
      mergedBusId: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    // check authorization
    if (payloadError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let ligneBus = await LigneBusModel.findById(params.id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // On ne peut pas s'ajouter soit même
    if (payload.mergedBusId === ligneBus.busId) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    }

    // On vérifie que la nouvelle ligne existe dans le PDT courant
    const newLigneBus = await PlanTransportModel.findOne({ busId: payload.mergedBusId, cohort: ligneBus.cohort });
    if (!newLigneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // on vérifie qu'elle n'est pas déjà fusionnée
    if (ligneBus.mergedBusIds.find((b) => b === payload.mergedBusId)) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    }

    // Mise à jour des lignes fusionnées existantes
    const oldMergedBusIds = ligneBus.mergedBusIds;
    if (!oldMergedBusIds.includes(ligneBus.busId)) {
      oldMergedBusIds.push(ligneBus.busId);
    }
    const newMergedBusIds = [...oldMergedBusIds, payload.mergedBusId];
    await syncMergedBus(ligneBus, newMergedBusIds, newMergedBusIds);

    const infoBus = await getInfoBus(ligneBus);
    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Suppression d'une ligne fusionnée
router.delete("/:id/ligne-fusionnee/:mergedBusId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // check params
    const { error, value: params } = Joi.object({
      id: Joi.string().required(),
      mergedBusId: Joi.string().required(),
    }).validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // check authorization
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let ligneBus = await LigneBusModel.findById(params.id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!ligneBus.mergedBusIds.find((b) => b === params.mergedBusId)) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // Mise à jour des lignes fusionnées existantes
    const oldMergedBusIds = ligneBus.mergedBusIds;
    if (!oldMergedBusIds.includes(ligneBus.busId)) {
      oldMergedBusIds.push(ligneBus.busId);
    }
    let newMergedBusIds = oldMergedBusIds.filter((b) => b !== params.mergedBusId);
    if (newMergedBusIds.length === 1) {
      newMergedBusIds = [];
    }
    await syncMergedBus(ligneBus, oldMergedBusIds, newMergedBusIds);

    const infoBus = await getInfoBus(ligneBus);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
