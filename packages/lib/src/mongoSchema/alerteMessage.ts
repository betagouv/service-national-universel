import { Schema, InferSchemaType } from "mongoose";

import { ROLES_LIST } from "../roles";
import { InterfaceExtended } from ".";

export const AlerteMessageSchema = {
  priority: {
    type: String,
    enum: ["normal", "important", "urgent"],
    required: true,
    documentation: {
      description: "Niveau de priorité du message.",
    },
  },
  to_role: {
    type: [String],
    enum: ROLES_LIST,
    required: true,
    documentation: {
      description: "Destinateire(s) du message",
    },
  },
  title: {
    type: String,
    maxLength: 100,
    required: true,
    documentation: {
      description: "Titre du message",
    },
  },
  content: {
    type: String,
    maxLength: 1000,
    required: true,
    documentation: {
      description: "Contenu du message",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création du message",
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de la dernière modification du message",
    },
  },
  deletedAt: {
    type: Date,
    documentation: {
      description: "Date de suppression du message",
    },
  },
};

const schema = new Schema(AlerteMessageSchema);
export type AlerteMessageType = InterfaceExtended<InferSchemaType<typeof schema>>;
