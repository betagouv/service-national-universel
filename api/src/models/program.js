const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const MODELNAME = "program";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom du programmes",
    },
  },
  descriptionText: {
    type: String,
    documentation: {
      description: "desc du programme",
    },
  },
  descriptionWhat: {
    type: String,
    documentation: {
      description: "desc du programme : Qu'est ce que c'est ?",
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
  imageFile: {
    type: String,
    documentation: {
      description: "image (fichier)",
    },
  }, //todo
  imageString: {
    type: String,
    default: "default.png", //todo
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
