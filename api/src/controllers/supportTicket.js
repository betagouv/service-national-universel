const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const TicketModel = require("../models/supportTicket");
const { ERRORS } = require("../utils");

router.get("/", passport.authenticate("support-user", { session: false, failWithError: true }), async (req, res) => {
  try {
    const query = {};
    // const query = { $or: [{ emitterYoungId: { $exists: true, $ne: null } }, { emitterUserId: { $exists: true, $ne: null } }] };
    const limit = 50;
    const skip = (req.query.page - 1) * limit;

    if (Object.keys(req.query).includes("ticketsIds")) {
      if (!req.query.ticketsIds?.length) return res.status(200).send({ ok: true, data: [] });
      query._id = { $in: req.query.ticketsIds.split(",") };
      const tickets = await TicketModel.find(query).sort({ createdAt: -1 }).populate("messages.emitterUserId").populate("emitterYoungId emitterUserId");
      return res.status(200).send({ ok: true, data: tickets });
    }

    const tickets = await TicketModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    return res.status(200).send({ ok: true, data: tickets });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
