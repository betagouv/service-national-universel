import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import esClient from "../../es";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";

const MODELNAME = "pointderassemblement";

const schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Code du point de rassemblement",
    },
  },

  cohorts: {
    type: [String],
    required: true,
    documentation: {
      description: "Cohorte du point de rassemblement",
    },
  },

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du point de rassemblement",
    },
  },

  address: {
    type: String,
    required: true,
    documentation: {
      description: "Adresse du point de rassemblement",
    },
  },

  complementAddress: {
    type: [
      {
        cohort: {
          type: String,
          documentation: {
            description: "Cohorte du complément d'adresse",
          },
        },
        complement: {
          type: String,
          documentation: {
            description: "Complément d'adresse",
          },
        },
      },
    ],
    documentation: {
      description: "Complément d'adresse du point de rassemblement",
    },
  },

  city: {
    type: String,
    required: true,
    documentation: {
      description: "Ville du point de rassemblement",
    },
  },

  zip: {
    type: String,
    required: true,
    documentation: {
      description: "Code postal du point de rassemblement",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département du point de rassemblement",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région du point de rassemblement",
    },
  },

  location: {
    lat: { type: Number },
    lon: { type: Number },
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

export type PointDeRassemblementType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PointDeRassemblementDocument<T = {}> = DocumentExtended<PointDeRassemblementType & T>;
type SchemaExtended = PointDeRassemblementDocument & UserExtension;

export const PointDeRassemblementModel = mongoose.model<PointDeRassemblementDocument>(MODELNAME, schema);
