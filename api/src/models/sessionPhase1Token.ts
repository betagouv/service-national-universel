import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, SessionPhase1TokenSchema, MONGO_COLLECTION } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = MONGO_COLLECTION.SESSION_PHASE1_TOKEN;

const schema = new Schema(SessionPhase1TokenSchema);

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

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

type SessionPhase1TokenType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SessionPhase1TokenDocument<T = {}> = DocumentExtended<SessionPhase1TokenType & T>;
type SchemaExtended = SessionPhase1TokenDocument & UserExtension;

export const SessionPhase1TokenModel = mongoose.model<SessionPhase1TokenDocument>(MODELNAME, schema);
