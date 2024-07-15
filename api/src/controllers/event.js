const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const { EventModel } = require("../models");
const { ERRORS, isYoung } = require("../utils");
const { validateEvent } = require("../utils/validator");
const { canCreateEvent } = require("snu-lib");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: event } = validateEvent(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    // Only accessible by persons who can access associations for now (aka referents and admins).
    // The only event creatable id of type "ASSOCIATION" currently.
    if (!canCreateEvent(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await EventModel.create({ ...event, userId: req.user.id, userType: isYoung(req.user) ? "young" : "referent" });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
