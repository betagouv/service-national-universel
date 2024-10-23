import mongoose, { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const SchoolRAMSESchema = {
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
};

const schema = new Schema(SchoolRAMSESchema, { timestamps: true });
export type SchoolRAMSESType = InterfaceExtended<InferSchemaType<typeof schema>>;
