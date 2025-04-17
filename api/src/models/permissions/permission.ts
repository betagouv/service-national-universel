import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MONGO_COLLECTION, PermissionSchema } from "snu-lib";

import { DocumentExtended, UserExtension, UserSaved, CustomSaveParams } from "../types";

const schema = new Schema(PermissionSchema);

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
  name: `${MONGO_COLLECTION.PERMISSION}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MONGO_COLLECTION.PERMISSION },
    user: { type: Object, required: true, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

// schema.index({ ressource: 1, action: 1 });

type PermissionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PermissionDocument<T = {}> = DocumentExtended<PermissionType & T>;
type SchemaExtended = PermissionDocument & UserExtension;

export const PermissionModel = mongoose.model<PermissionDocument>(MONGO_COLLECTION.PERMISSION, schema);
