import mongoose, { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const SchoolSchema = {
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
};

const schema = new Schema(SchoolSchema, { timestamps: true });
export type SchoolType = InterfaceExtended<InferSchemaType<typeof schema>>;
