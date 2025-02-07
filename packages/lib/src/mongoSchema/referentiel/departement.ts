import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const DepartementSchema = {
  code: {
    type: String,
    required: true,
    documentation: {
      description: "Code du département - ex: 001",
    },
  },
  libelle: {
    type: String,
    required: true,
    documentation: {
      description: "Libellé du département - ex: AIN",
    },
  },
  regionAcademique: {
    type: String,
    required: true,
    documentation: {
      description: "Région Academique du département - ex: AUVERNE-RHONE-ALPES",
    },
  },
  academie: {
    type: String,
    required: true,
    documentation: {
      description: "Académie du département - ex: LYON",
    },
  },
  chefLieu: {
    type: String,
    documentation: {
      description: "Chef-lieu du département - ex: Bourg En Bresse",
    },
  },
  dateCreationSI: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de création de l'enregistrement du département dans le SI-SNU",
    },
  },
  dateDerniereModificationSI: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de dernière modification de l'enregistrement du département dans le SI-SNU",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(DepartementSchema);
export type DepartementType = InterfaceExtended<InferSchemaType<typeof schema>>;
