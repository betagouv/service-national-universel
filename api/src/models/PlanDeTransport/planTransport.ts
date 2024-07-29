import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";
import { getCohortNames } from "snu-lib";

import esClient from "../../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";

import { schema as ModificationBusSchema } from "./modificationBus";
import { PointDeRassemblementModel } from "./pointDeRassemblement";

const MODELNAME = "plandetransport";

const EnrichedPointDeRassemblementSchema = PointDeRassemblementModel.discriminator(
  "Enriched",
  new Schema({
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
      enum: ["train", "bus", "fusée", "avion"],
      documentation: {
        description: "Type de transport",
      },
    },
  }),
).schema;

const schema = new Schema({
  cohort: {
    type: String,
    required: true,
    enum: getCohortNames(),
    documentation: {
      description: "Cohorte de la ligne de bus",
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
    type: [EnrichedPointDeRassemblementSchema],
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
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

schema.plugin(mongooseElastic(esClient), MODELNAME);

schema.index({ ligneDeBusId: 1 });

export type PlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PlanTransportDocument<T = {}> = DocumentExtended<PlanTransportType & T>;
type SchemaExtended = PlanTransportDocument & UserExtension;

export const PlanTransportModel = mongoose.model<PlanTransportDocument>(MODELNAME, schema);
