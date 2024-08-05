import mongoose, { Schema, InferSchemaType } from "mongoose";

import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "school";

const schema = new Schema(
  {
    version: { type: String },
    uai: { type: String },
    name1: { type: String },
    name2: { type: String },
    fullName: { type: String },
    postcode: { type: String },
    city: { type: String },
    department: { type: String },
    type: { type: String },
    country: { type: String, default: "France" },
    apiAdressObject: mongoose.Schema.Types.Mixed,
    csvObject: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export type SchoolType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchoolDocument<T = {}> = DocumentExtended<SchoolType & T>;

export const SchoolModel = mongoose.model<SchoolDocument>(MODELNAME, schema);
