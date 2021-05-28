const mongoose = require("mongoose");

const MODELNAME = "email";

// https://developers.sendinblue.com/docs/transactional-webhooks

const Schema = new mongoose.Schema({
  
  event: { type: String }, // request, delivered, deferred, clicked, unique_opened, invalid_email, sent, soft_bounce, hard_bounce, opened, unsubscribe, complaint, blocked, error
  email: { type: String },
  domain: { type: String }, 
  organisation: { type: String },
  subject: { type: String },
  date: { type: Date, default: Date.now },
  messageId: { type: String },
  templateId: { type: String },
  tags: [{ type: String }],
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
