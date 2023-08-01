const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { getSejourNotes } = require("../../services/stats.service");

router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      phase: Joi.string().valid("inscription", "sejour", "engagement", "all").required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const user = req.user;
    const { startDate, endDate, phase } = value;

    let notes = [];

    switch (phase) {
      case "inscription":
        // TODO
        break;
      case "sejour": {
        notes.push(...(await getSejourNotes(startDate, endDate, user)));
        break;
      }
      case "engagement":
        // TODO
        break;
      case "all": {
        notes.push(...(await getSejourNotes(startDate, endDate, user)));
        break;
      }
      default:
        break;
    }

    res.status(200).send({ ok: true, data: notes });
  } catch (error) {
    console.log(error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
