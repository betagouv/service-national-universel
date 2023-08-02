const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { getKeyNumbers } = require("../../services/stats.service");

router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      phase: Joi.string().valid("inscription", "sejour", "engagement", "all").required(),
    });
    const { value, error } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { startDate, endDate, phase } = value;
    const notes = await getKeyNumbers(phase, startDate, endDate, req.user);
    res.status(200).send({ ok: true, data: notes });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
