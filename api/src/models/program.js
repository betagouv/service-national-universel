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
  description: {
    type: String,
    documentation: {
      description: "desc du programme",
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
      description: "image",
    },
  }, //todo
  type: {
    type: String,
    documentation: {
      description: "",
    },
  },

  department: {
    type: String,
    documentation: {
      description: "",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "",
    },
  },
  isNational: {
    type: String,
    enum: ["true", "false"],
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
