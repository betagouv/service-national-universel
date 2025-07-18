import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { AlerteMessageSchema, AlerteMessageType, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.ALERTE_MESSAGE;

const schema = new Schema(AlerteMessageSchema);

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = buildPatchUser(params.fromUser);
  }
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
