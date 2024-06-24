const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "cohesioncenter";
const anonymize = require("../anonymization/cohesionCenter");

const Schema = new mongoose.Schema({
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

Schema.methods.anonymise = function () {
  return anonymize(this);
};

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
  this.updatedAt = Date.now();
  next();
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
