import passport from "passport";
import express, { Response } from "express";

import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { SessionPhase1Model, LigneBusModel } from "../models";
import { validateId } from "../utils/validator";

import { UserRequest } from "../controllers/request";

const router = express.Router();
router.get("/:id/plan-de-transport", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id).select({ cohort: 1, cohesionCenterId: 1 });
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const lignesDeBus = await LigneBusModel.find({ cohort: session.cohort, centerId: session.cohesionCenterId }).select({ _id: 1 });

    return res.status(200).send({ ok: true, data: lignesDeBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
