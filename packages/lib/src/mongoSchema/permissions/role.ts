import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "../..";

export const RoleSchema = {
  code: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Identifiant du rôle (ex: 'admin')",
    },
  },
  parent: {
    type: String,
    default: null,
    documentation: {
      description: "Code du rôle parent (pour les sous-rôles/fonctions)",
    },
  },
  titre: {
    type: String,
    required: true,
    default: null,
    documentation: {
      description: "Nom du rôle (ex: Administrateur CLE",
    },
  },
  description: {
    type: String,
    default: null,
    documentation: {
      description: "Description du rôle",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(RoleSchema);
export type RoleType = InterfaceExtended<InferSchemaType<typeof schema>>;
