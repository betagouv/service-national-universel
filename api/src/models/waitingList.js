const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "waitinglist";

const Schema = new mongoose.Schema({
  zip: {
    type: String,
    documentation: {
      description: "Code postal du jeune",
    },
  },
  mail: {
    type: String,
    documentation: {
      description: "Mail du jeune",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
