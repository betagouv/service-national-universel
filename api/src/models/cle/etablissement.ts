import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import mongooseElastic from "@selego/mongoose-elastic";
import { CLE_TYPE_LIST, CLE_SECTOR_LIST } from "snu-lib";

import esClient from "../../es";
import { CustomSaveParams, UserExtension, UserSaved, DocumentExtended, InterfaceExtended } from "../types";

import { ClasseModel } from "./classe";

const MODELNAME = "etablissement";

const schema = new Schema({
  schoolId: {
    type: String,
    required: false,
    documentation: {
      description: "School Ramses rataché à l'établissement",
    },
  },

  uai: {
    type: String,
    required: true,
    documentation: {
      description: "Code UAI de l'établissement",
    },
  },

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de l'établissement",
    },
  },

  referentEtablissementIds: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des ids des chefs d'établissement",
    },
  },

  coordinateurIds: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des ids des coordinateurs d'établissement",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département de l'établissement",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région de l'établissement",
    },
  },

  zip: {
    type: String,
    required: true,
    documentation: {
      description: "Code postal de l'établissement",
    },
  },

  city: {
    type: String,
    required: true,
    documentation: {
      description: "Ville de l'établissement",
    },
  },

  address: {
    type: String,
    documentation: {
      description: "Adresse de l'établissement",
    },
  },

  country: {
    type: String,
    required: true,
    documentation: {
      description: "Pays de l'établissement",
    },
  },

  type: {
    type: [String],
    enum: CLE_TYPE_LIST,
    documentation: {
      description: "Type d'établissement",
    },
  },

  sector: {
    type: [String],
    enum: CLE_SECTOR_LIST,
    documentation: {
      description: "Secteur de l'établissement",
    },
  },

  state: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "inactive",
    documentation: {
      description: "Etat de l'etablissement, active si au moins un eleves inscrits dans l'année scolaire en cours",
    },
  },

  academy: {
    type: String,
    required: true,
    documentation: {
      description: "Académie de l'établissement",
    },
  },

  schoolYears: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des années scolaires",
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

schema.pre<SchemaExtended>("save", async function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
  this.updatedAt = new Date();
  if (!this.isNew && (this.isModified("department") || this.isModified("region"))) {
    const classes = await ClasseModel.find({ etablissementId: this._id });
    if (classes.length > 0) {
      await ClasseModel.updateMany(
        { etablissementId: this._id },
        {
          department: this.department,
          region: this.region,
          academy: this.academy,
        },
      );
    }
  }

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

export type EtablissementType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type EtablissementDocument<T = {}> = DocumentExtended<EtablissementType & T>;
type SchemaExtended = EtablissementDocument & UserExtension;

export const EtablissementModel = mongoose.model<EtablissementDocument>(MODELNAME, schema);
