import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { ImportPlanTransportSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";

const MODELNAME = "importplandetransport";

const schema = new Schema(ImportPlanTransportSchema);

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
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

type ImportPlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ImportPlanTransportDocument<T = {}> = DocumentExtended<ImportPlanTransportType & T>;
type SchemaExtended = ImportPlanTransportDocument & UserExtension;

export const ImportPlanTransportModel = mongoose.model<ImportPlanTransportDocument>(MODELNAME, schema);
