import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { AlerteMessageSchema, AlerteMessageType } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "alerteMessage";

const schema = new Schema(AlerteMessageSchema);

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

export type AlerteMessageDocument<T = {}> = DocumentExtended<AlerteMessageType & T>;
type SchemaExtended = AlerteMessageDocument & UserExtension;

export const AlerteMessageModel = mongoose.model<AlerteMessageDocument>(MODELNAME, schema);
