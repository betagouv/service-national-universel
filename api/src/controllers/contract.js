const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");
const ContractObject = require("../models/contract");
const { ERRORS } = require("../utils");

router.post("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const obj = req.body;
    const data = await ContractObject.create(obj);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
