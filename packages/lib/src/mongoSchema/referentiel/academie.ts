import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const AcademieSchema = {
  code: {
    type: String,
    required: true,
    documentation: {
      description: "Code de l'académie - ex: 01",
    },
  },
  libelle: {
    type: String,
    required: true,
    documentation: {
      description: "Libellé de l'académie - ex: LYON",
    },
  },
  regionAcademique: {
    type: String,
    required: true,
    documentation: {
      description: "Région Académique de l'académie - ex: AUVERGNE-RHONE-ALPES",
    },
  },
  dateCreationSI: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de création de l'enregistrement de l'académie dans le SI-SNU",
    },
  },
  dateDerniereModificationSI: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de dernière modification de l'enregistrement de l'académie dans le SI-SNU",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(AcademieSchema);
export type AcademieType = InterfaceExtended<InferSchemaType<typeof schema>>;
