import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, LigneToPointSchema, MONGO_COLLECTION, getUserToSave, getVirtualUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.LIGNE_TO_POINT;

const schema = new Schema(LigneToPointSchema);

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

type LigneToPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type LigneToPointDocument<T = {}> = DocumentExtended<LigneToPointType & T>;
type SchemaExtended = LigneToPointDocument & UserExtension;

export const LigneToPointModel = mongoose.model<LigneToPointDocument>(MODELNAME, schema);
