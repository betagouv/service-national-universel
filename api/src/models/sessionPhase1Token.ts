import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  InterfaceExtended,
  SessionPhase1TokenSchema,
  MONGO_COLLECTION,
  getVirtualUser,
  getUserToSave,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

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

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = getUserToSave(params.fromUser);
  }
  this.updatedAt = new Date();
  next();
});

type SessionPhase1TokenType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SessionPhase1TokenDocument<T = {}> = DocumentExtended<SessionPhase1TokenType & T>;
type SchemaExtended = SessionPhase1TokenDocument & UserExtension;

export const SessionPhase1TokenModel = mongoose.model<SessionPhase1TokenDocument>(MODELNAME, schema);
