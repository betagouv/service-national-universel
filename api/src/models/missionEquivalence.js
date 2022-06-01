const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "missionEquivalence";

const Schema = new mongoose.Schema({
  youngId: {
    type: String,
    documentation: {
      description: "Identifiant du jeune",
    },
  },
  status: {
    type: String,
    enum: ["WAITING_VERIFICATION", "WAITING_CORRECTION", "DONE", "REJECTED"],
    documentation: {
      description: "Statut de l'équivalence",
    },
  },
  type: {
    type: String,
    enum: ["Service Civique", "BAFA", "Jeune Sapeur Pompier"],
    documentation: {
      description: "Type de mission",
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
