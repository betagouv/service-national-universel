import express from "express";

import { CohortsRoutes } from "snu-lib";

import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { RouteRequest, RouteResponse } from "./request";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";

import { CohortsRoutesSchema } from "../cohort/cohortValidator";
import { isInscriptionOpen } from "../cohort/cohortService";

const router = express.Router();

// GOO-65 (lot P23) : `POST /eligibility/2023/:id?` servait le changement de séjour (admin et app) et le
// changement d'adresse ; ces parcours sont décommissionnés, la route est supprimée.

router.get(
  "/isInscriptionOpen",
  requestValidatorMiddleware(CohortsRoutesSchema.GetIsIncriptionOpen),
  async (req: RouteRequest<CohortsRoutes["GetIsIncriptionOpen"]>, res: RouteResponse<CohortsRoutes["GetIsIncriptionOpen"]>) => {
    try {
      const isOpen = await isInscriptionOpen(req.validatedQuery.sessionName);

      return res.json({
        ok: true,
        data: isOpen,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
