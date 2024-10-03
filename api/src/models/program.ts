import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "program";

const schema = new Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom du programmes",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "description du programme",
    },
  },
  descriptionFor: {
    type: String,
    documentation: {
      description: "desc du programme : C'est pour ?",
    },
  },
  descriptionMoney: {
    type: String,
    documentation: {
      description: "desc du programme : Est-ce indemnisé",
    },
  },
  descriptionDuration: {
    type: String,
    documentation: {
      description: "desc du programme : Quelle durée d'engagement ?",
    },
  },
  url: {
    type: String,
    documentation: {
      description: "lien vers son site web",
    },
  },
  urlPhaseEngagement: {
    type: String,
    documentation: {
      description: "lien vers le site web avec un tracking spécifique pour JVA",
    },
  },
  imageFile: {
    type: String,
    documentation: {
      description: "image (fichier)",
    },
  },
  imageString: {
    type: String,
    default: "default.png",
    documentation: {
      description: "nom fichier image",
    },
  },
  type: {
    type: String,
    documentation: {
      description: "Type de l'engagement (formation, engagement, ...)",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département concerné, si applicable",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région concernée, si applicable",
    },
  },
  visibility: {
    type: String,
    documentation: {
      description: "",
    },
  },

  publisherName: {
    type: String,
    documentation: "Ce champ nous sert à filtrer les mission JVA et serviceCivique sur la phase 2 engagement, à ne pas modifier",
  },

  order: {
    type: Number,
    documentation: "champ utilisé pour ordonner l'affichage des programmes",
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

export type ProgramType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ProgramDocument<T = {}> = DocumentExtended<ProgramType & T>;
type SchemaExtended = ProgramDocument & UserExtension;

export const ProgramModel = mongoose.model<ProgramDocument>(MODELNAME, schema);
