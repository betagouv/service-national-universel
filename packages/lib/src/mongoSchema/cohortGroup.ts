import { Schema, InferSchemaType } from "mongoose";

import { InterfaceExtended } from ".";
import { COHORT_TYPE_LIST } from "../constants/constants";

export const CohortGroupSchema = {
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du groupe de cohortes. Exp: CLE 2024, HTS 2025.",
    },
  },
  type: {
    type: String,
    enum: COHORT_TYPE_LIST,
    documentation: {
      description: "Type de cohortes : CLE ou VOLONTAIRE.",
    },
  },
  year: {
    type: Number,
    documentation: {
      description: "Année de la cohorte.",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CohortGroupSchema);
export type CohortGroupType = InterfaceExtended<InferSchemaType<typeof schema>>;
