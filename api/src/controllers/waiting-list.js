const express = require("express");
const router = express.Router();

const { capture } = require("../sentry");
const WaitingListModel = require("../models/waitingList");
const { ERRORS } = require("../utils");
const { validateWaitingList } = require("../utils/validator");

router.post("/", async (req, res) => {
  try {
    const { error, value } = validateWaitingList(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await WaitingListModel.create(value);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
