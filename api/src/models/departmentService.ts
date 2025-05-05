import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DepartmentServiceSchema, InterfaceExtended, MONGO_COLLECTION, getVirtualUser, getUserToSave, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import anonymize from "../anonymization/departmentService";

const MODELNAME = MONGO_COLLECTION.DEPARTMENT_SERVICE;

const schema = new Schema(DepartmentServiceSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

type DepartmentServiceType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type DepartmentServiceDocument<T = {}> = DocumentExtended<DepartmentServiceType & T>;
type SchemaExtended = DepartmentServiceDocument & UserExtension;

export const DepartmentServiceModel = mongoose.model<DepartmentServiceDocument>(MODELNAME, schema);
