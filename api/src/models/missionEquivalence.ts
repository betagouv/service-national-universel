import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";
import anonymize from "../anonymization/missionEquivalence";
import { UNSS_TYPE, ENGAGEMENT_TYPES, ENGAGEMENT_LYCEEN_TYPES } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "missionequivalence";

const schema = new Schema({
  youngId: {
    type: String,
    documentation: {
      description: "Identifiant du jeune",
    },
  },
  status: {
    type: String,
    enum: ["WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED"],
    documentation: {
      description: "Statut de l'équivalence",
    },
  },
  type: {
    type: String,
    enum: [...ENGAGEMENT_TYPES],
    documentation: {
      description: "Type de mission",
    },
  },
  desc: {
    type: String,
    documentation: {
      description: "Description du type de mission si le type sélectionné est 'Autre'",
    },
  },
  sousType: {
    type: String,
    enum: [...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES],
    documentation: {
      description: "Sous-type de mission",
    },
  },
  structureName: {
    type: String,
    documentation: {
      description: "Nom de la structure d'accueil",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse de la structure d'accueil",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal de la structure d'accueil",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville de la structure d'accueil",
    },
  },
  startDate: {
    type: Date,
    documentation: {
      description: "Date de début de la mission",
    },
  },
  endDate: {
    type: Date,
    documentation: {
      description: "Date de fin de la mission",
    },
  },

  // legacy
  frequency: {
    type: {
      nombre: String,
      duree: String,
      frequence: String,
    },
    documentation: {
      description: "Fréquence de la mission",
    },
  },

  missionDuration: {
    type: Number,
    documentation: {
      description: "Durée de la mission pour cette candidature (peut-être différent de la durée initiale)",
    },
  },

  contactFullName: {
    type: String,
    documentation: {
      description: "Nom et prénom du contact au sein de la structure",
    },
  },
  contactEmail: {
    type: String,
    documentation: {
      description: "Email du contact au sein de la structure",
    },
  },

  files: {
    type: [String],
    documentation: {
      description: "Liste des fichiers joints",
    },
  },

  message: {
    type: String,
    documentation: {
      description: "Message de correction ou de refus",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser) {
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

export type MissionEquivalenceType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionEquivalenceDocument<T = {}> = DocumentExtended<MissionEquivalenceType & T>;
type SchemaExtended = MissionEquivalenceDocument & UserExtension;

export const MissionEquivalenceModel = mongoose.model<MissionEquivalenceDocument>(MODELNAME, schema);
