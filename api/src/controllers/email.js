//See: https://developers.sendinblue.com/docs/how-to-use-webhooks

const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");

const { ERRORS } = require("../utils");
const { capture, captureMessage } = require("../sentry");
const { EmailModel } = require("../models");
const { canViewEmailHistory } = require("snu-lib");
const { serializeEmail } = require("../utils/serializer");
const { getEmailsList, getEmailContent } = require("../brevo");
const { validateId } = require("../utils/validator");

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: email } = Joi.string().lowercase().trim().email().required().validate(req.query.email);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canViewEmailHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const data = await EmailModel.find({ email }).sort("-date");
    return res.status(200).send({ ok: true, data: data.map((e) => serializeEmail(e)) });
  } catch (error) {
    capture(error);
  }
  return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewEmailHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Get email from db
    const mail = await EmailModel.findById(value);
    if (!mail) {
      captureMessage("Error finding email with id : " + JSON.stringify(value));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const { email, messageId } = mail;

    const year = messageId.slice(1, 5);
    const month = messageId.slice(5, 7);
    const day = messageId.slice(7, 9);
    const formattedDate = `${year}-${month}-${day}`;

    const emails = await getEmailsList({ email, messageId, startDate: formattedDate, endDate: formattedDate });
    if (!emails?.count || emails.code) {
      captureMessage("Error while fetching email" + JSON.stringify({ emails, email, messageId, startDate: formattedDate, endDate: formattedDate }));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const uuid = emails.transactionalEmails[0].uuid;

    const emailData = await getEmailContent(uuid);
    if (!emailData || emailData.code) {
      captureMessage("Error while fetching email" + JSON.stringify(emailData));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(200).send({ ok: true, data: emailData });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
