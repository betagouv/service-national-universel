const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "cohesioncenter";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    documentation: {
      description: "Nom du centre",
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
  COR: {
    type: String,
    documentation: {
      description: "",
    },
  },
  departmentCode: {
    type: String,
    documentation: {
      description: "Numéro du départment du centre",
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
      description: "Départment du centre",
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
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
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
