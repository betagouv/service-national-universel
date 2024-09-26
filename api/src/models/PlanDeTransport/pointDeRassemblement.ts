import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import esClient from "../../es";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { PointDeRassemblementSchema, PointDeRassemblementType } from "snu-lib";

const MODELNAME = "pointderassemblement";

const schema = new Schema(PointDeRassemblementSchema);

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

// schema.plugin(mongooseElastic(esClient), MODELNAME);

export type PointDeRassemblementDocument<T = {}> = DocumentExtended<PointDeRassemblementType & T>;
type SchemaExtended = PointDeRassemblementDocument & UserExtension;

export const PointDeRassemblementModel = mongoose.model<PointDeRassemblementDocument>(MODELNAME, schema);
