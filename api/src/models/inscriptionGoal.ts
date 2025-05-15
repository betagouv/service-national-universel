import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InscriptionGoalSchema, InterfaceExtended, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.INSCRIPTION_GOAL;

const schema = new Schema(InscriptionGoalSchema);

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

type InscriptionGoalType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type InscriptionGoalDocument<T = {}> = DocumentExtended<InscriptionGoalType & T>;
type SchemaExtended = InscriptionGoalDocument & UserExtension;

export const InscriptionGoalModel = mongoose.model<InscriptionGoalDocument>(MODELNAME, schema);
