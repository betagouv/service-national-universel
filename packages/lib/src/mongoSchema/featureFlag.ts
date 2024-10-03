import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const FeatureFlagSchema = {
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
};

const schema = new Schema(FeatureFlagSchema);
export type FeatureFlagType = InterfaceExtended<InferSchemaType<typeof schema>>;
