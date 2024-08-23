import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import anonymize from "../anonymization/cohesionCenter";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "cohesioncenter";

const schema = new Schema({
  name: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  code2022: {
    type: String,
    documentation: {
      description: "Code du centre utilisé en 2022",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse du centre",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal du centre",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département du centre",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région du centre",
    },
  },
  addressVerified: {
    type: String,
    documentation: {
      description: "Adresse validée",
    },
  },
  placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  pmr: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Accessibilité aux personnes à mobilité réduite",
    },
  },

  cohorts: {
    type: [String],
    documentation: {
      description: "Liste des cohortes concernées par ce centre de cohésion",
    },
  },
  cohortIds: {
    type: [String],
    documentation: {
      description: "Liste des Ids des cohortes concernées par ce centre de cohésion",
    },
  },
  academy: {
    type: String,
    documentation: {
      description: "Académie du centre",
    },
  },

  typology: {
    type: String,
    enum: ["PUBLIC_ETAT", "PUBLIC_COLLECTIVITE", "PRIVE_ASSOCIATION", "PRIVE_AUTRE"],
    documentation: {
      description: "Typologie du centre",
    },
  },

  domain: {
    type: String,
    enum: ["ETABLISSEMENT", "VACANCES", "FORMATION", "AUTRE"],
    documentation: {
      description: "Domaine du centre",
    },
  },

  complement: {
    type: String,
    documentation: {
      description: "Complément",
    },
  },

  centerDesignation: {
    type: String,
    documentation: {
      description: "Désignation du centre",
    },
  },

  //TODO : CLEAN AFTER MERGE NEW CENTER

  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },
  outfitDelivered: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  observations: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  waitingList: {
    type: [String],
    documentation: {
      description: "Liste ordonnée des jeunes en liste d'attente sur ce cente de cohésion",
    },
  },

  COR: {
    type: String,
    documentation: {
      description: "",
    },
  },
  code: {
    type: String,
    documentation: {
      description: "Code du centre",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays du centre",
    },
  },
  departmentCode: {
    type: String,
    documentation: {
      description: "Numéro du département du centre",
    },
  },

  sessionStatus: {
    type: [String],
    enum: ["VALIDATED", "DRAFT", "WAITING_VALIDATION"],
    documentation: {
      description: "Status de la globalité des cohortes d'un centre",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

export type CohesionCenterType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type CohesionCenterDocument<T = {}> = DocumentExtended<CohesionCenterType & T>;
type SchemaExtended = CohesionCenterDocument & UserExtension;

export const CohesionCenterModel = mongoose.model<CohesionCenterDocument>(MODELNAME, schema);
