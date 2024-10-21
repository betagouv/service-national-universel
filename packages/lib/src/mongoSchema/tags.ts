import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const TagsSchema = {
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["modification_bus"],
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(TagsSchema);
export type TagsType = InterfaceExtended<InferSchemaType<typeof schema>>;
