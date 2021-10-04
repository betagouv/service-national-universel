const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const EventObject = require("../models/event");
const { ERRORS, isYoung } = require("../utils");
const { validateEvent } = require("../utils/validator");

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: event } = validateEvent(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    await EventObject.create({ ...event, userId: req.user.id, userType: isYoung(req.user) ? "young" : "referent" });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
