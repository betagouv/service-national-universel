import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";

import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "email";

// https://developers.sendinblue.com/docs/transactional-webhooks

const schema = new Schema({
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

// schema.plugin(mongooseElastic(esClient), MODELNAME);

export type EmailType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EmailDocument<T = {}> = DocumentExtended<EmailType & T>;

export const EmailModel = mongoose.model<EmailDocument>(MODELNAME, schema);
