const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;

const esClient = require("../es");

const MODELNAME = "structure";

const Schema = new mongoose.Schema({
  sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "Identifiant dans l'ancienne base de données",
    },
  },
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de la structure",
    },
  }, // OK
  siret: {
    type: String,
    documentation: {
      description: "Numéro de SIRET de la structure",
    },
  }, // OK
  description: {
    type: String,
    documentation: {
      description: "Description de la structure",
    },
  }, // OK

  website: {
    type: String,
    documentation: {
      description: "lien vers le site internet de la structure",
    },
  },
  facebook: {
    type: String,
    documentation: {
      description: "lien vers le facebook de la structure",
    },
  },
  twitter: {
    type: String,
    documentation: {
      description: "lien vers le twitter de la structure",
    },
  },
  instagram: {
    type: String,
    documentation: {
      description: "lien vers l'instagram de la structure",
    },
  },

  status: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "DRAFT"],
    documentation: {
      description: "Statut de la structure",
    },
  },

  sqlUserId: {
    type: String,
    documentation: {
      description: "Identifiant dans l'ancienne base de données de l'utilisateur lié à cette structure",
    },
  },
  isNetwork: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "La structure est une tête de réseau. Une structure qui a des antennes reparties dans toutes la France",
    },
  },
  networkId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure principale (tête de réseau).",
    },
  },
  networkName: {
    type: String,
    documentation: {
      description: "Nom de la structure principale (tête de réseau).",
    },
  },
  sqlNetworkId: {
    type: String,
    documentation: {
      description: "Identifiant dans l'ancienne base de données de la structure principale",
    },
  },

  legalStatus: {
    type: String,
    default: "ASSOCIATION",
    enum: ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"],
    documentation: {
      description: "Statut juridique",
    },
  },

  associationTypes: {
    type: [String],
    documentation: {
      description: "Type d'association, si applicable",
    },
  },

  structurePubliqueType: {
    type: String,
    documentation: {
      description: "Type de structure publique, si applicable",
    },
  },
  structurePubliqueEtatType: {
    type: String,
    documentation: {
      description: "Type de service de l'état, si applicable",
    },
  },
  structurePriveeType: {
    type: String,
    documentation: {
      description: "Type de structure privée, si applicable",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse de la structure",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal de la structure",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville de la structure",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département de la structure",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région de la structure",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays de la structure",
    },
  },
  location: {
    lon: { type: Number },
    lat: { type: Number },
  },

  state: {
    type: String,
    documentation: {
      description: "",
    },
  },

  isMilitaryPreparation: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "La structure est une préparation militaire",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
  },
});
Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
