import { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended } from ".";
import { ListeDiffusionEnum } from "../domains/planMarketing/constants";

export const ListeDiffusionSchema = {
  nom: { type: String, required: true },
  type: { type: String, enum: Object.values(ListeDiffusionEnum), required: true },
  filters: {
    type: Object,
    required: true,
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

export const schema = new Schema(ListeDiffusionSchema);
export type ListeDiffusionType = InterfaceExtended<InferSchemaType<typeof schema>>;
