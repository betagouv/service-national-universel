import express from "express";

import { ROLES, ReferentsRoutes } from "snu-lib";

import { RouteRequest, RouteResponse } from "../../controllers/request";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { GetReferentsByIdsSchema } from "./referentValidator";
import { getReferentsByIds } from "./referentService";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { toErrorCode } from "../../utils/errorCode";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post(
  "/getMany",
  accessControlMiddleware([ROLES.ADMIN]),
  requestValidatorMiddleware({ body: GetReferentsByIdsSchema.payload }),
  async (req: RouteRequest<ReferentsRoutes["GetMany"]>, res: RouteResponse<ReferentsRoutes["GetMany"]>) => {
    try {
      const payload = req.validatedBody;

      const ids = payload.ids;
      const referents = await getReferentsByIds(ids);

      return res.status(200).send({ ok: true, data: referents });
    } catch (error) {
      if (error.message.includes("Referents not found")) {
        return res.status(404).send({
          ok: false,
          code: ERRORS.NOT_FOUND,
          message: error.message,
        });
      }

      capture(error);
      res.status(500).send({ ok: false, code: toErrorCode(error) });
    }
  },
);

export default router;
