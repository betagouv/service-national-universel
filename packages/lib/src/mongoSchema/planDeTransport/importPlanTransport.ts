import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "../..";

export const ImportPlanTransportSchema = {
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  lines: {
    type: [Object],
    documentation: {
      description: "Détails des lignes de bus (on ne définit pas l'intérieur pour plus de malléabilité sur l'import",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(ImportPlanTransportSchema);
export type ImportPlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
