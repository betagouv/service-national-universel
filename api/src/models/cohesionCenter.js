const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
