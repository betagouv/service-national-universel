import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const InscriptionGoalSchema = {
  department: {
    type: String,
    documentation: {
      description: "Nom du département",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Nom de la région (peut être déduit du département)",
    },
  },
  academy: {
    type: String,
    documentation: {
      description: "Nom de l'académie (peut être déduit du département)",
    },
  },
  max: {
    type: Number,
    documentation: {
      description: "Jauge (nombre maximum de volontaires acceptés)",
    },
  },
  cohort: {
    type: String,
    default: "2021",
    documentation: {
      description: "Cohorte des jeunes",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  fillingRate: {
    type: Number,
    documentation: {
      description: "taux de remplissage (en pourcentage)",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(InscriptionGoalSchema);
export type InscriptionGoalType = InterfaceExtended<InferSchemaType<typeof schema>>;
