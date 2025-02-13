import passport from "passport";
import express, { Response } from "express";

import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { SessionPhase1Model, LigneBusModel } from "../models";
import { validateId } from "../utils/validator";

import { RouteRequest, RouteResponse, UserRequest } from "../controllers/request";
import { SessionPhase1Routes } from "snu-lib";
import { getSessionPhase1ByIds } from "./sessionPhase1Service";
import { GetSessionPhase1ByIdsSchema } from "./sessionPhase1Validator";

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

    const lignesDeBus = await LigneBusModel.find({ cohortId: session.cohortId, centerId: session.cohesionCenterId }).select({ _id: 1 });

    return res.status(200).send({ ok: true, data: lignesDeBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/getMany",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<SessionPhase1Routes["GetMany"]>, res: RouteResponse<SessionPhase1Routes["GetMany"]>) => {
    try {
      const { error, value: payload } = GetSessionPhase1ByIdsSchema.payload.validate(req.body, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const ids = payload.ids;
      const sessions = await getSessionPhase1ByIds(ids);

      return res.status(200).send({ ok: true, data: sessions });
    } catch (error) {
      if (error.message.includes("Sessions not found")) {
        return res.status(404).send({
          ok: false,
          code: ERRORS.NOT_FOUND,
          message: error.message,
        });
      }
      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

module.exports = router;
