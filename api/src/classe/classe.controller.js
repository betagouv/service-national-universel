const passport = require("passport");
const express = require("express");
const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS, isReferent } = require("../utils");
const { canDownloadYoungDocuments } = require("snu-lib");
const { generateCertificatesByClasseId } = require("./classe.service");

const router = express.Router();
router.post(
  "/:id/certificates",
  passport.authenticate(["young", "referent"], {
    session: false,
    failWithError: true,
  }),
  async (req, res) => {
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
