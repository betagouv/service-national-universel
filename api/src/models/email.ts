import { config } from "../config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";

import { DocumentExtended } from "./types";
import { EmailSchema, InterfaceExtended } from "snu-lib";

const MODELNAME = "email";

// https://developers.sendinblue.com/docs/transactional-webhooks

const schema = new Schema(EmailSchema);

if (config.ENABLE_MONGOOSE_ELASTIC) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

type EmailType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EmailDocument<T = {}> = DocumentExtended<EmailType & T>;

export const EmailModel = mongoose.model<EmailDocument>(MODELNAME, schema);
