import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import esClient from "../../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";

const MODELNAME = "lignetopoint";

const schema = new Schema({
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
    enum: ["train", "bus", "fusée", "avion"],
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
          enum: ["train", "bus", "fusée", "avion"],
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

export type LigneToPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type LigneToPointDocument<T = {}> = DocumentExtended<LigneToPointType & T>;
type SchemaExtended = LigneToPointDocument & UserExtension;

export const LigneToPointModel = mongoose.model<LigneToPointDocument>(MODELNAME, schema);
