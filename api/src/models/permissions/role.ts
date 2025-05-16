import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MONGO_COLLECTION, RoleSchema, CustomSaveParams, DocumentExtended, UserExtension, UserSaved } from "snu-lib";

const schema = new Schema(RoleSchema);

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
  name: `${MONGO_COLLECTION.ROLE}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MONGO_COLLECTION.ROLE },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

// schema.index({ code: 1 });

type RoleType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type RoleDocument<T = {}> = DocumentExtended<RoleType & T>;
type SchemaExtended = RoleDocument & UserExtension;

export const RoleModel = mongoose.model<RoleDocument>(MONGO_COLLECTION.ROLE, schema);
