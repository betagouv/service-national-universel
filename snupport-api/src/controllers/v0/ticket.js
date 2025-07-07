const express = require("express");
const Joi = require("joi");
const router = express.Router();
const  { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../../middlewares/validation");
const TicketModel = require("../../models/ticket");
const ContactModel = require("../../models/contact");
const MessageModel = require("../../models/message");
const { SCHEMA_ID } = require("../../schemas");

const NOT_FOUND = "NOT_FOUND";

router.use(apiKeyGuard);

router.get("/",
  validateQuery(Joi.object({
    email: Joi.string().email().lowercase(),
  }).prefs({ presence: 'required' })), // TODO: fill schema
  async (req, res) => {
    const query = { email: req.cleanQuery.email };
    const contact = await ContactModel.findOne(query);
    let tickets = [];
    if (contact) tickets = await TicketModel.find({ contactId: contact._id });
    return res.status(200).send({ ok: true, data: tickets });
  }
);

router.get("/withMessages",
  validateQuery(Joi.object({
    ticketId: SCHEMA_ID,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const ticket = await TicketModel.findOne({ _id: req.cleanQuery.ticketId });
    if (!ticket) return res.status(404).send({ ok: false, code: NOT_FOUND });
    const messages = await MessageModel.find({ ticketId: ticket._id });

    if (!messages.length) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data: { ticket, messages } });
  }
);

router.post("/count",
  validateBody(Joi.object({
    type: Joi.string().valid("department", "region"),
    value: Joi.when('type', {
      switch: [
          { is: "department", then: Joi.array().items(Joi.string()) },
      ],
      otherwise: Joi.string()
    }),
  })),
  async (req, res) => {
    let query = { $and: [] };
    let queryContactAttributes = { $and: [] };

    if (req.cleanBody.type === "department") {
      queryContactAttributes.$and.push({ contactAttributes: { $elemMatch: { value: { $in: req.cleanBody.value } } } });
    } else if (req.cleanBody.type === "region") {
      queryContactAttributes.$and.push({ contactAttributes: { $elemMatch: { value: req.cleanBody.value } } });
    }
    queryContactAttributes.$and.push({ contactAttributes: { $elemMatch: { value: { $in: ["young", "young exterior", "parent", "responsible", "unknown"] } } } });

    query.$and.push(queryContactAttributes);
    query.$and.push({ subject: "J'ai une question" });

    let queryOpenAndNew = JSON.parse(JSON.stringify(query));
    queryOpenAndNew.$and.push({ status: { $in: ["OPEN", "NEW"] } });

    let queryClosed = JSON.parse(JSON.stringify(query));
    queryClosed.$and.push({ status: "CLOSED" });
    queryClosed.$and.push({ updatedAt: { $gte: getDate(new Date(), -30) } });

    const queryOr = {
      $or: [queryOpenAndNew, queryClosed],
    };

    const pipeline = [{ $match: queryOr }, { $group: { _id: "$status", total: { $sum: 1 } } }];
    const tickets = await TicketModel.aggregate(pipeline);
    if (!tickets) return res.status(404).send({ ok: false, code: NOT_FOUND });
    return res.status(200).send({ ok: true, data: tickets });
  }
);

/*
Routes deleted as not used :
PATCH /v0/ticket/<id>
POST /v0/ticket/search
*/

module.exports = router;

function getDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
