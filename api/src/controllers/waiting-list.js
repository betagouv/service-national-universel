const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const WaitingListModel = require("../models/waitingList");
const { ERRORS } = require("../utils");

router.post("/", async (req, res) => {
  try {
    const data = await WaitingListModel.create(req.body);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
