import mongoose, { Schema, InferSchemaType } from "mongoose";

import { DocumentExtended } from "./types";
import { EmailSchema, InterfaceExtended, MONGO_COLLECTION } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.EMAIL;

// https://developers.sendinblue.com/docs/transactional-webhooks

const schema = new Schema(EmailSchema);

type EmailType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EmailDocument<T = {}> = DocumentExtended<EmailType & T>;

export const EmailModel = mongoose.model<EmailDocument>(MODELNAME, schema);
