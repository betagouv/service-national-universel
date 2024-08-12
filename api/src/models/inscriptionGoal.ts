import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import { getCohortNames } from "snu-lib";

import esClient from "../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "inscriptiongoal";

const schema = new Schema({
  department: {
    type: String,
    documentation: {
      description: "Nom du département",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Nom de la région (peut être déduit du département)",
    },
  },
  academy: {
    type: String,
    documentation: {
      description: "Nom de l'académie (peut être déduit du département)",
    },
  },
  max: {
    type: Number,
    documentation: {
      description: "Jauge (nombre maximum de volontaires acceptés)",
    },
  },
  cohort: {
    type: String,
    enum: getCohortNames(true, false, true),
    default: "2021",
    documentation: {
      description: "Cohorte des jeunes",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  fillingRate: {
    type: Number,
    documentation: {
      description: "taux de remplissage (en pourcentage)",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
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

export type InscriptionGoalType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type InscriptionGoalDocument<T = {}> = DocumentExtended<InscriptionGoalType & T>;
type SchemaExtended = InscriptionGoalDocument & UserExtension;

export const InscriptionGoalModel = mongoose.model<InscriptionGoalDocument>(MODELNAME, schema);
