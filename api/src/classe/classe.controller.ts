import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { ERRORS, isReferent } from "../utils";
import { canDownloadYoungDocuments } from "snu-lib";
import { generateConvocationsByClasseId } from "./classe.service";

import { UserRequest } from "../controllers/request";

const router = express.Router();
router.post(
  "/:id/convocations",
  passport.authenticate(["young", "referent"], {
    session: false,
    failWithError: true,
  }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({ id: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, null, "convocation")) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      const { id } = value;
      const convocations = await generateConvocationsByClasseId(id);
      res.set({
        "content-length": convocations.length,
        "content-disposition": `inline; filename="test.zip"`,
        "content-type": "application/pdf",
        "cache-control": "public, max-age=1",
      });
      res.send(convocations);
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: error.message });
    }
  },
);
module.exports = router;
