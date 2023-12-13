const express = require("express");
const router = express.Router();

const { capture } = require("../Services/sentry");
const WaitingListModel = require("../Databases/Mongo/Models/waitingList");
const { ERRORS } = require("../../Application/Utils");
const { validateWaitingList } = require("../../Application/Utils/validator");
const { sendTemplate } = require("../Services/sendinblue");
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
