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

const { validateFirstName } = require("../utils/validator");
const passport = require("passport");

router.post("/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error, value: newRequests } = Joi.array()
      .items(
        Joi.object({
          cohort: validateFirstName().trim().required(),
          field: Joi.string().uppercase().trim().required(),
          reason: Joi.string(),
          message: Joi.string(),
          status: Joi.string().valid("PENDING", "SENT", "REMINDED", "CORRECTED", "CANCELED").required(),
        }),
      )
      .validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sentAt = Date.now();
    for (const request of newRequests) {
      request.moderatorId = req.user._id;
      request.sentAt = sentAt;
    }

    const requests = young.correctionRequests ? young.correctionRequests : [];
    requests.push(...newRequests);

    young.set({ correctionRequests: requests });
    await young.save({ fromUser: req.user });

    // TODO: send notifications for new corrections requests

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
