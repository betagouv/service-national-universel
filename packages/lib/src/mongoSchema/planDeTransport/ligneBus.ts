import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const LigneBusTeamSchema = {
  role: {
    type: String,
    required: true,
    documentation: {
      description: "Role de l'accompagnant",
    },
  },
  lastName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de l'accompagnant",
    },
  },
  firstName: {
    type: String,
    required: true,
    documentation: {
      description: "Prenom de l'accompagnant",
    },
  },
  birthdate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de naissance de l'accompagnant",
    },
  },
  mail: {
    type: String,
    required: true,
    documentation: {
      description: "Email de l'accompagnant",
    },
  },
  phone: {
    type: String,
    required: true,
    documentation: {
      description: "Numéro de téléphone de l'accompagnant",
    },
  },
  forth: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par l'aller",
    },
  },
  back: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par le retour",
    },
  },
};

export const LigneBusSchema = {
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

  codeCourtDeRoute: {
    type: String,
    documentation: {
      description: "code court de la route (SI SNU)",
    },
  },

  busId: {
    type: String,
    required: true,
    documentation: {
      description: "Numero de bus",
    },
  },

  departuredDate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de départ",
    },
  },

  returnDate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de retour",
    },
  },

  youngCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité de jeunes",
    },
  },

  totalCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité totale",
    },
  },

  followerCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité d'accompagnateurs",
    },
  },

  youngSeatsTaken: {
    type: Number,
    required: true,
    default: 0,
    documentation: {
      description: "Nombre de jeunes",
    },
  },

  travelTime: {
    type: String,
    required: true,
    documentation: {
      description: "Temps de route",
    },
  },

  lunchBreak: {
    type: Boolean,
    documentation: {
      description: "Pause déjeuner aller",
    },
  },

  lunchBreakReturn: {
    type: Boolean,
    documentation: {
      description: "Pause déjeuner retour",
    },
  },

  sessionId: {
    type: String,
    required: true,
    documentation: {
      description: "Session",
    },
  },

  centerId: {
    type: String,
    required: true,
    documentation: {
      description: "Centre de destination",
    },
  },

  centerArrivalTime: {
    type: String,
    required: true,
    documentation: {
      description: "Heure d'arrivée au centre",
    },
  },

  centerDepartureTime: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de départ du centre",
    },
  },
  classeId: {
    type: String,
    documentation: {
      description: "Id de la classe",
    },
  },

  meetingPointsIds: {
    type: [String],
    required: true,
    documentation: {
      description: "Liste des points de rassemblement",
    },
  },

  team: {
    type: [LigneBusTeamSchema],
    documentation: {
      description: "Liste des accompagnateurs du bus",
    },
  },
  delayedForth: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La ligne est retardée à l'allée",
    },
  },
  delayedBack: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La ligne est retardée au Retour",
    },
  },
  mergedBusIds: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des lignes de bus fusionnées",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema({
  ...LigneBusSchema,
  team: {
    ...LigneBusSchema.team,
    type: [new Schema(LigneBusTeamSchema)],
  },
});
export type LigneBusType = InterfaceExtended<InferSchemaType<typeof schema>>;
