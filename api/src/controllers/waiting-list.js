const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const WaitingListModel = require("../models/waitingList");
const { ERRORS } = require("../utils");
const validateFromReferent  = require("../utils/referent");

router.post("/", async (req, res) => {
  try {
    const { error, value : checkedWaitingList } = validateFromReferent.validateWaitingList(req.body);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await WaitingListModel.create(checkedWaitingList);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
