const express = require("express");
const router = express.Router();

const { capture } = require("../sentry");
const WaitingListModel = require("../models/waitingList");
const { ERRORS } = require("../utils");
const { validateWaitingList } = require("../utils/validator");
const { sendTemplate } = require("../brevo");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

router.post("/", async (req, res) => {
  try {
    const { error, value } = validateWaitingList(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const data = await WaitingListModel.create(value);
    await sendTemplate(SENDINBLUE_TEMPLATES.young.WAITING_LIST, {
      emailTo: [{ email: data.mail }],
    });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
