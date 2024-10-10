import config from "config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import mongooseElastic from "@selego/mongoose-elastic";

import { DepartmentServiceSchema, InterfaceExtended } from "snu-lib";

import esClient from "../es";
import anonymize from "../anonymization/departmentService";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "departmentservice";

const schema = new Schema(DepartmentServiceSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

type DepartmentServiceType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type DepartmentServiceDocument<T = {}> = DocumentExtended<DepartmentServiceType & T>;
type SchemaExtended = DepartmentServiceDocument & UserExtension;

export const DepartmentServiceModel = mongoose.model<DepartmentServiceDocument>(MODELNAME, schema);
