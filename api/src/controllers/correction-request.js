/**
 * /correction-request
 *
 * ROUTES
 *   POST   /:youngId -> create new requests
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const YoungModel = require("../models/young");
const { capture } = require("../sentry");
const { serializeYoung } = require("../utils/serializer");
const { ERRORS } = require("../utils");
const passport = require("passport");
const { canUpdateYoungStatus, YOUNG_STATUS, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { sendTemplate } = require("../sendinblue");
const { APP_URL } = require("../config");

router.post("/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error, value: newRequests } = Joi.array()
      .items(
        Joi.object({
          cohort: Joi.string().trim().required(),
          field: Joi.string().required(),
          reason: Joi.string().allow(""),
          message: Joi.string().allow(""),
          status: Joi.string().valid("PENDING", "SENT", "REMINDED", "CORRECTED", "CANCELED").required(),
        }),
      )
      .validate(req.body, { stripUnknown: true });

    if (error) {
      console.log("Joi Error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sentAt = Date.now();
    for (const request of newRequests) {
      request.moderatorId = req.user._id;
      request.sentAt = sentAt;
      request.status = "SENT";
    }

    const requests = young.correctionRequests ? young.correctionRequests : [];
    requests.push(...newRequests);

    if (!canUpdateYoungStatus({ body: { status: YOUNG_STATUS.WAITING_CORRECTION }, current: young })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ correctionRequests: requests, status: YOUNG_STATUS.WAITING_CORRECTION });
    await young.save({ fromUser: req.user });

    // --- send notifications for new corrections requests
    try {
      await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: `${APP_URL}/`,
        },
      });
    } catch (e) {
      capture(e);
    }

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
