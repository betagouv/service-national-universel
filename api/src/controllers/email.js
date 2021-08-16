//See: https://developers.sendinblue.com/docs/how-to-use-webhooks

const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const Netmask = require("netmask").Netmask;

const { ERRORS } = require("../utils");
const { sendTemplate } = require("../sendinblue");
const { capture } = require("../sentry");
const EmailObject = require("../models/email");
const { canViewEmailHistory } = require("snu-lib/roles");

function ipAllowListMiddleware(req, res, next) {
  // See: https://www.clever-cloud.com/doc/find-help/faq/#how-to-get-the-users-ip-address
  const ip = req.headers["x-forwarded-for"];
  // See: https://developers.sendinblue.com/docs/how-to-use-webhooks#securing-your-webhooks
  const block = new Netmask("185.107.232.0/24");
  // See: https://developers.sendinblue.com/docs/additional-ips-to-be-whitelisted
  const allowedIpList = [
    "195.154.31.153",
    "195.154.31.142",
    "195.154.79.186",
    "195.154.31.171",
    "195.154.31.129",
    "163.172.109.130",
    "163.172.109.105",
    "163.172.77.49",
    "163.172.109.49",
    "163.172.109.19",
    "195.154.30.169",
    "163.172.76.108",
    "163.172.99.26",
    "163.172.77.137",
    "163.172.77.62",
    "163.172.23.50",
    "163.172.75.222",
    "163.172.75.202",
    "51.159.71.10",
    "51.159.71.12",
    "51.159.71.13",
    "51.159.71.15",
    "51.159.71.17",
    "51.159.71.41",
    "163.172.99.58",
    "51.159.58.33",
    "51.159.58.37",
    "51.159.58.36",
    "51.159.58.214",
  ];
  if (ip && (block.contains(ip) || allowedIpList.includes(ip))) return next();
  return res.status(401).send({ ok: false, code: ERRORS.INVALID_IP, message: "Invalid IP" });
}

router.post("/", ipAllowListMiddleware, async (req, res) => {
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
    if (!canViewEmailHistory(req.user)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const data = await EmailObject.find({ email: req.query.email }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
  }
  return res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
});

module.exports = router;
