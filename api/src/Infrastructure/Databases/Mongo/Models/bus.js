const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../ElasticSearch");

const MODELNAME = "bus";

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
    documentation: {
      description: "Cohorte",
    },
  },
  idExcel: {
    type: String,
  },
  capacity: {
    type: Number,
    documentation: {
      description: "Nombre de passager (volontaire) possible",
    },
  },
  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
