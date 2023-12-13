const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../ElasticSearch");

const MODELNAME = "filter";

const Schema = new mongoose.Schema({
  userId: {
    type: String,
  },
  url: {
    type: String,
    documentation: {
      description: "Url contenant tous les filtres preselectionnés",
    },
  },
  page: {
    type: String,
    documentation: {
      description: "Page sur laquelle se trouve le filtre",
    },
  },
  name: {
    type: String,
    documentation: {
      description: "Nom de la sauvegarde des filtres",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
