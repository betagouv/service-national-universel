import { Schema, InferSchemaType } from "mongoose";

import { InterfaceExtended } from "../..";

export const ModificationBusSchema = {
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte de la ligne de bus",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  //Informations de la ligne de bus
  lineId: {
    type: String,
    required: true,
    documentation: {
      description: "Id de la ligne de bus",
    },
  },

  lineName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de la ligne de bus",
    },
  },

  // Informations de la demande
  requestMessage: {
    type: String,
    required: true,
    documentation: {
      description: "Message de la demande de modification",
    },
  },

  requestUserId: {
    type: String,
    required: true,
    documentation: {
      description: "Id de l'utilisateur ayant fait la demande",
    },
  },

  requestUserName: {
    type: String,
    required: true,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant fait la demande",
    },
  },

  requestUserRole: {
    type: String,
    required: true,
    documentation: {
      description: "Rôle de l'utilisateur ayant fait la demande",
    },
  },

  tagIds: {
    type: [String],
    required: false,
    documentation: {
      description: "Id des tags de la demande",
    },
  },

  // Informations de la modification sur le statut de la demande (pour es)
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    documentation: {
      description: "Statut de la demande",
    },
  },

  statusUserId: {
    type: String,
    required: false,
    documentation: {
      description: "Id de l'utilisateur ayant changé le statut de la demande",
    },
  },

  statusUserName: {
    type: String,
    required: false,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant changé le statut de la demande",
    },
  },

  statusDate: {
    type: Date,
    required: false,
    documentation: {
      description: "Date du changement de statut de la demande",
    },
  },

  // Informations de la modification sur l'avis de la demande (pour es)
  opinion: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Avis sur la demande",
    },
  },

  opinionUserId: {
    type: String,
    required: false,
    documentation: {
      description: "Id de l'utilisateur ayant donné son avis sur la demande",
    },
  },

  opinionUserName: {
    type: String,
    required: false,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant donné son avis sur la demande",
    },
  },

  opinionDate: {
    type: Date,
    required: false,
    documentation: {
      description: "Date de l'avis sur la demande",
    },
  },

  messages: {
    type: [
      {
        message: {
          type: String,
          documentation: {
            description: "Message",
          },
        },
        userId: {
          type: String,
          required: true,
          documentation: {
            description: "Id de l'utilisateur ayant envoyé le message / avis",
          },
        },
        userName: {
          type: String,
          required: true,
          documentation: {
            description: "Prénom / nom de l'utilisateur ayant envoyé le message / avis",
          },
        },
        date: {
          type: Date,
          required: true,
          documentation: {
            description: "Date du message / avis",
          },
        },
      },
    ],
    required: false,
    documentation: {
      description: "Conversation sur la demande",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(ModificationBusSchema);
export type ModificationBusType = InterfaceExtended<InferSchemaType<typeof schema>>;
