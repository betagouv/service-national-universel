import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";
import { TRANSPORT_MODES } from "../../domains";

export const LigneToPointSchema = {
  lineId: {
    type: String,
    required: true,
    documentation: {
      description: "ID de la ligne de bus",
    },
  },

  meetingPointId: {
    type: String,
    required: true,
    documentation: {
      description: "ID du point de rassemblement",
    },
  },

  busArrivalHour: {
    type: String,
    documentation: {
      description: "Heure d'arrivée du bus",
    },
  },

  departureHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de départ",
    },
  },

  meetingHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de convocation",
    },
  },

  returnHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de retour",
    },
  },

  transportType: {
    type: String,
    required: true,
    enum: TRANSPORT_MODES,
    documentation: {
      description: "Type de transport",
    },
  },

  stepPoints: {
    type: [
      {
        type: {
          type: String,
          enum: ["aller", "retour"],
          documentation: {
            description: "Correspondance aller ou correspondance retour",
          },
        },
        address: {
          type: String,
          documentation: {
            description: "Adresse du point d'étape",
          },
        },
        departureHour: {
          type: String,
          documentation: {
            description: "Heure de départ du point d'étape",
          },
        },
        returnHour: {
          type: String,
          documentation: {
            description: "Heure de retour du point d'étape",
          },
        },
        transportType: {
          type: String,
          enum: TRANSPORT_MODES,
          documentation: {
            description: "Type de transport du point d'étape",
          },
        },
      },
    ],
    documentation: {
      description: "Point d'étape",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(LigneToPointSchema);
export type LigneToPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
