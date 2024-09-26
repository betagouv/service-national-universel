import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "schoolramses";

const schema = new Schema(
  {
    uai: { type: String },
    fullName: { type: String },
    postcode: { type: String },
    type: { type: String },
    departmentName: { type: String },
    region: { type: String },
    city: { type: String },
    country: { type: String },
    adresse: { type: String },
    department: { type: String },
    codeCity: { type: String },
    codePays: { type: String },
    raw_data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

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

// schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["raw_data"] }), MODELNAME);

export type SchoolRAMSESType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchoolRAMSESDocument<T = {}> = DocumentExtended<SchoolRAMSESType & T>;
type SchemaExtended = SchoolRAMSESDocument & UserExtension;

export const SchoolRAMSESModel = mongoose.model<SchoolRAMSESDocument>(MODELNAME, schema);
