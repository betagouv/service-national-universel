import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";

import { canViewLigneBus } from "snu-lib";
import { capture } from "../sentry";
import { ERRORS } from "../utils";

import { LigneBusModel } from "../models";
// eslint-disable-next-line import/extensions
import { BusDocument } from "../models/PlanDeTransport/ligneBus.type";
import { UserRequest } from "../controllers/request";

const router = express.Router({ mergeParams: true });

// Récupération du plan de transport
router.get("/:cohort/ligne-de-bus/:busId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // check params
    const { value: params, error: paramsError } = Joi.object({
      cohort: Joi.string().required(),
      busId: Joi.string().required(),
    }).validate(req.params);
    if (paramsError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // check authorization
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // On récupère les infos du bus
    const ligneBus: BusDocument = await LigneBusModel.findOne({ busId: params.busId, cohort: params.cohort });
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: ligneBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
