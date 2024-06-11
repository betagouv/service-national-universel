import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";

import { canEditLigneBusGeneralInfo } from "snu-lib";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";

import { LigneBusModel } from "../../models";
// eslint-disable-next-line import/extensions
import { BusDocument } from "../../models/PlanDeTransport/ligneBus.type";
import { UserRequest } from "../../controllers/request";
import { validateId, idSchema } from "../../utils/validator";

import { getInfoBus, syncMergedBus } from "./ligneDeBusService";

const router = express.Router({ mergeParams: true });

// Ajout d'une ligne fusionnée
router.post("/:id/ligne-fusionnee", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // check params
    const { value: id, error: paramsError } = validateId(req.params.id);
    if (paramsError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // check payload
    const { value: payload, error: payloadError } = Joi.object({
      mergedBusId: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (payloadError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // check authorization
    if (!canEditLigneBusGeneralInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let ligneBus: BusDocument = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // On ne peut pas s'ajouter soit même
    if (payload.mergedBusId === ligneBus.busId) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    }

    // On vérifie que la nouvelle ligne existe dans le PDT courant
    const newLigneBus = await LigneBusModel.findOne({ busId: payload.mergedBusId, cohort: ligneBus.cohort });
    if (!newLigneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // on vérifie qu'elle n'est pas déjà fusionnée
    if (ligneBus.mergedBusIds?.find((b) => b === payload.mergedBusId)) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    }

    // Mise à jour des lignes fusionnées existantes
    const oldMergedBusIds = ligneBus.mergedBusIds || [];
    if (!oldMergedBusIds.includes(ligneBus.busId)) {
      oldMergedBusIds.push(ligneBus.busId);
    }
    const newMergedBusIds = [...oldMergedBusIds, payload.mergedBusId].sort();
    await syncMergedBus({ ligneBus, busIdsToUpdate: newMergedBusIds, newMergedBusIds });

    const infoBus = await getInfoBus(ligneBus);
    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Suppression d'une ligne fusionnée
router.delete("/:id/ligne-fusionnee/:mergedBusId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // check params
    const { error, value: params } = Joi.object({
      id: idSchema().required(),
      mergedBusId: Joi.string().required(),
    }).validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // check authorization
    if (!canEditLigneBusGeneralInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let ligneBus: BusDocument = await LigneBusModel.findById(params.id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!ligneBus.mergedBusIds?.find((b) => b === params.mergedBusId)) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // Mise à jour des lignes fusionnées existantes
    const oldMergedBusIds = ligneBus.mergedBusIds || [];
    if (!oldMergedBusIds.includes(ligneBus.busId)) {
      oldMergedBusIds.push(ligneBus.busId);
    }
    let newMergedBusIds = oldMergedBusIds.filter((b) => b !== params.mergedBusId).sort();
    if (newMergedBusIds.length === 1) {
      newMergedBusIds = [];
    }
    await syncMergedBus({ ligneBus, busIdsToUpdate: oldMergedBusIds, newMergedBusIds });

    const infoBus = await getInfoBus(ligneBus);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
