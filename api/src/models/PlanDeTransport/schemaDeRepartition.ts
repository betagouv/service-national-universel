import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "../types";

const MODELNAME = "schemaderepartition";

const schema = new Schema({
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte",
    },
  },
  intradepartmental: {
    type: String,
    enum: ["true", "false"],
    required: true,
    documentation: {
      description: "Groupe pour les volontaires intradéparementaux",
    },
  },
  fromDepartment: {
    type: String,
    documentation: {
      description: "Département d'origine",
    },
  },
  fromRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Région d'origine",
    },
  },
  toDepartment: {
    type: String,
    documentation: {
      description: "Département de destination",
    },
  },
  toRegion: {
    type: String,
    documentation: {
      description: "Région de destination",
    },
  },
  centerId: {
    type: String,
    documentation: {
      description: "Identifiant du centre",
    },
  },
  centerName: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  centerCity: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  sessionId: {
    type: String,
    documentation: {
      description: "Identifiant de la session du centre correspondant à la cohorte",
    },
  },
  youngsVolume: {
    type: Number,
    default: 0,
    documentation: {
      description: "Nombre de jeune pour ce groupe",
    },
  },
  gatheringPlaces: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des points de rassemblements permettant d'accéder au centre pour ce groupe.",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "centerId",
  foreignField: "_id",
  justOne: true,
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

export type SchemaDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchemaDeRepartitionDocument<T = {}> = DocumentExtended<SchemaDeRepartitionType & T>;
type SchemaExtended = SchemaDeRepartitionDocument & UserExtension;

export const SchemaDeRepartitionModel = mongoose.model<SchemaDeRepartitionDocument>(MODELNAME, schema);
