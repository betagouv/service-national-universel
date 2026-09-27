import express from "express";
import passport from "passport";
import Joi from "joi";

import { canViewInscriptionGoals } from "snu-lib";

import { capture } from "../sentry";
import { InscriptionGoalModel } from "../models";
import { ERRORS } from "../utils";
import { UserRequest } from "./request";

const router = express.Router();

// GOO-65 (lot P23) : les objectifs d'inscription sont décommissionnés. Leur écriture
// (`POST /:cohort`) et les calculs de jauge (`GET /:cohort/department/:department`, `.../reached`,
// `GET /:department/current`) sont supprimés ; seule la lecture qui alimente l'export du tableau de
// bord reste servie.
router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // 2021 can be empty in database. This could be removed once all data is migrated.
    const data = await InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
