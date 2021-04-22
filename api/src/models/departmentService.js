const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "departmentservice";

const Schema = new mongoose.Schema({
  department: {
    type: String,
    documentation: {
      description: "Nom du département",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Nom de la région (peut être déduit du département)",
    },
  },
  directionName: {
    type: String,
    documentation: {
      description: "Nom de la direction",
    },
  },
  serviceName: {
    type: String,
    documentation: {
      description: "Nom du service",
    },
  },
  serviceNumber: {
    type: String,
    documentation: {
      description: "Numero du bureau",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "Information comlpémentaire",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
