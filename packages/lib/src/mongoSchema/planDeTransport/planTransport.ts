import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

import { PointDeRassemblementSchema } from "./pointDeRassemblement";
import { ModificationBusSchema } from "./modificationBus";
import { TRANSPORT_MODES } from "../../domains";

export const PlanTransportPointDeRassemblementEnrichedSchema = {
  // * ES ne save pas le champ _id si il est contenu dans un array, obligé de corriger le plugin ElasticMongoose ou de dupliquer l'id
  meetingPointId: {
    type: String,
    required: true,
    documentation: {
      description: "Champ contenant l'ID du MeetingPoint",
    },
  },
  busArrivalHour: {
    type: String,
    documentation: {
      description: "Heure d'arrivée du bus",
    },
  },
  meetingHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de convocation lié à ce spécifique bus et point de rassemblement",
    },
  },
  departureHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de départ",
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
};

export const PlanTransportSchema = {
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

  departureString: {
    type: String,
    required: true,
    documentation: {
      description: "Date de départ",
    },
  },

  returnString: {
    type: String,
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

  youngSeatsTaken: {
    type: Number,
    required: true,
    default: 0,
    documentation: {
      description: "Nombre de jeunes",
    },
  },

  lineFillingRate: {
    type: Number,
    documentation: {
      description: "Taux de remplissage de la ligne",
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

  // session: {
  //   type: SessionPhase1Schema,
  //   required: true,
  //   documentation: {
  //     description: "Session",
  //   },
  // },

  centerId: {
    type: String,
    required: true,
    documentation: {
      description: "ID du centre",
    },
  },

  centerRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Region du centre",
    },
  },

  centerDepartment: {
    type: String,
    required: true,
    documentation: {
      description: "Département du centre",
    },
  },

  centerAddress: {
    type: String,
    documentation: {
      description: "Adresse du centre",
    },
  },
  centerZip: {
    type: String,
    documentation: {
      description: "Code postal du centre",
    },
  },

  centerName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du centre",
    },
  },

  centerCode: {
    type: String,
    // required: true,
    documentation: {
      description: "Code du centre",
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

  pointDeRassemblements: {
    type: [PlanTransportPointDeRassemblementEnrichedSchema],
    required: true,
    documentation: {
      description: "Liste des points de rassemblement",
    },
  },
  classeId: {
    type: String,
    documentation: {
      description: "ID de la classe",
    },
  },

  modificationBuses: {
    type: [ModificationBusSchema],
    required: true,
    documentation: {
      description: "Liste des modifications de lignes",
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema({
  ...PlanTransportSchema,
  modificationBuses: {
    ...PlanTransportSchema["modificationBuses"],
    type: [new Schema(ModificationBusSchema)],
  },
  pointDeRassemblements: {
    ...PlanTransportSchema["pointDeRassemblements"],
    type: [new Schema({ ...PointDeRassemblementSchema, ...PlanTransportPointDeRassemblementEnrichedSchema })],
  },
});

export type PlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
