import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

// https://developers.sendinblue.com/docs/transactional-webhooks

export const EmailSchema = {
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
};

const schema = new Schema(EmailSchema);
export type EmailType = InterfaceExtended<InferSchemaType<typeof schema>>;
