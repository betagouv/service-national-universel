import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, TagsSchema, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.SNU_TAG;

const schema = new Schema(TagsSchema);

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

type TagsType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type TagsDocument<T = {}> = DocumentExtended<TagsType & T>;
type SchemaExtended = TagsDocument & UserExtension;

export const TagsModel = mongoose.model<TagsDocument>(MODELNAME, schema);
