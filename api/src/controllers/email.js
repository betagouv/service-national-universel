const express = require("express");
const passport = require("passport");
const router = express.Router();

const { ERRORS } = require("../utils");

const { capture } = require("../sentry");
const EmailObject = require("../models/email");
//https://developers.sendinblue.com/docs/how-to-use-webhooks

router.post("/", async (req, res) => {
  console.log("EMAIL POST WEKBOOK", req.body);
  try {
    await EmailObject.create({
      event: req.body.event,
      email: req.body.email,
      subject: req.body.subject,
      date: req.body.date,
      messageId: req.body["message-id"],
      templateId: req.body["template_id"],
      tags: req.body.tags,
      reason: req.body.reason,
    });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

//@check
router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const data = await EmailObject.find({ email: req.query.email }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
  }
  return res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
});

module.exports = router;
