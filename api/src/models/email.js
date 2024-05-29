const MongooseElastic = require("@selego/mongoose-elastic");
const mongoose = require("mongoose");
const { esClient } = require("../es");

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
  messageUuid: { type: String },
  templateId: { type: String },
  tags: [{ type: String }],
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

Schema.plugin(MongooseElastic(esClient()), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
