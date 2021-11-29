const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "inscriptiongoal";

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
  max: {
    type: Number,
    documentation: {
      description: "Jauge (nombre maximum de volontaires acceptés)",
    },
  },
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
    default: "2021",
    documentation: {
      description: "Cohorte des jeunes",
    },
  },
  fillingRate: {
    type: Number,
    documentation: {
      description: "taux de remplissage (en pourcentage)",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
