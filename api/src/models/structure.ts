import { config } from "../config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import { InterfaceExtended, StructureSchema } from "snu-lib";

import esClient from "../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

import anonymize from "../anonymization/structure";

const MODELNAME = "structure";

const schema = new Schema(StructureSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

if (config.ENABLE_MONGOOSE_ELASTIC) {
  schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["jvaRawData"] }), MODELNAME);
}

type StructureType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type StructureDocument<T = {}> = DocumentExtended<StructureType & T>;
type SchemaExtended = StructureDocument & UserExtension;

export const StructureModel = mongoose.model<StructureDocument>(MODELNAME, schema);
