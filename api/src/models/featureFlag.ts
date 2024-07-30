import mongoose, { Schema, InferSchemaType } from "mongoose";

import { DocumentExtended, InterfaceExtended } from "./types";



const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  date: {
    from: {
      type: Date,
      default: null,
    },
    to: {
      type: Date,
      default: null,
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type FeatureFlagType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type FeatureFlagDocument<T = {}> = DocumentExtended<FeatureFlagType & T>;

export const FeatureFlagModel = mongoose.model<FeatureFlagDocument>("featureFlag", schema);
