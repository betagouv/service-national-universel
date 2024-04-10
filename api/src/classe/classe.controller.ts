import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { ERRORS, isReferent } from "../utils";
import { canDownloadYoungDocuments } from "snu-lib";
import { generateCertificatesByClasseId } from "./classe.service";

import { UserRequest } from "../controllers/request";

const router = express.Router();
router.post(
  "/:id/certificates",
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
      if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, null, "certificate")) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      const { id } = value;
      const certificates = await generateCertificatesByClasseId(id);
      // TODO : change content-length
      res.set({
        "content-length": "9999",
        "content-disposition": `inline; filename="test.zip"`,
        "content-type": "application/pdf",
        "cache-control": "public, max-age=1",
      });
      res.send(certificates);
    } catch (e) {
      capture(e);
    }
  },
);
module.exports = router;
