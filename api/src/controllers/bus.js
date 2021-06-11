const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const BusModel = require("../models/bus");
const { ERRORS } = require("../utils");

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await BusModel.findById(req.params.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
