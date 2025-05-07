import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MissionAPISchema, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.MISSION_API;

const schema = new Schema(MissionAPISchema);

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

type MissionAPIType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionAPIDocument<T = {}> = DocumentExtended<MissionAPIType & T>;
type SchemaExtended = MissionAPIDocument & UserExtension;

export const MissionAPIModel = mongoose.model<MissionAPIDocument>(MODELNAME, schema);
