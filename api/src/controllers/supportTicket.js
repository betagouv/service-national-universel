const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const TicketModel = require("../models/supportTicket");
const { ERRORS } = require("../utils");

router.get("/", passport.authenticate("support-user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const query = {};
    const limit = 50;
    query.page = req.query.page || 1;
    const skip = (query.page - 1) * limit;

    const tickets = await TicketModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    return res.status(200).send({ ok: true, data: tickets });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
