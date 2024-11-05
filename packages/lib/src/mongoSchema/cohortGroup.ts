import { Schema, InferSchemaType } from "mongoose";

import { InterfaceExtended } from "..";

export const CohortGroupSchema = {
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du groupe de cohortes. Exp: CLE 2024, HTS 2025.",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CohortGroupSchema);
export type CohortGroupType = InterfaceExtended<InferSchemaType<typeof schema>>;
