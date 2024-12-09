import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const RegionAcademiqueSchema = {
  code: {
    type: String,
    required: true,
    documentation: {
      description: "Code de la région académique - ex: BRE",
    },
  },
  libelle: {
    type: String,
    required: true,
    documentation: {
      description: "Libellé de la région académique - ex: Bretagne",
    },
  },
  zone: {
    type: String,
    required: true,
    documentation: {
      description: "Zone de la région académique - ex: A",
    },
  },
  date_creation_si: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de création de la région académique dans le SI-SNU",
    },
  },
  date_derniere_modification_si: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de dernière modification de la région académique dans le SI-SNU",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(RegionAcademiqueSchema);
export type RegionAcademiqueType = InterfaceExtended<InferSchemaType<typeof schema>>;
