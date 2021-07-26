const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");

const { ERRORS } = require("../utils");
const { sendTemplate } = require("../sendinblue");

const { capture } = require("../sentry");
const EmailObject = require("../models/email");
//https://developers.sendinblue.com/docs/how-to-use-webhooks

router.post("/", async (req, res) => {
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

router.post("/send-template/:id", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().pattern(/^\d+$/).required(), // only number
      emailTo: Joi.array()
        .items(Joi.object({ name: Joi.string().required(), email: Joi.string().trim().email().required() }))
        .required(),
      params: Joi.object().allow(null, "", {}),
      attachment: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.details.map((e) => e.message) });

    const { id: reqId, emailTo, params, attachment } = value;
    await sendTemplate(parseInt(reqId), { emailTo, params, attachment });
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
