import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const TableDeRepartitionSchema = {
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
  fromDepartment: {
    type: String,
    documentation: {
      description: "Département d'origine",
    },
  },
  fromRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Région d'origine",
    },
  },
  toRegion: {
    type: String,
    documentation: {
      description: "Région de destination",
    },
  },
  toDepartment: {
    type: String,
    documentation: {
      description: "Département de destination",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(TableDeRepartitionSchema);
export type TableDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
