const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "meetingpoint";

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
    documentation: {
      description: "Cohorte",
    },
  },
  busId: {
    type: String,
    documentation: {
      description: "Id du car qui fera le trajet",
    },
  },
  busExcelId: {
    type: String,
    documentation: {
      description: "Id du fichier import du car qui fera le trajet",
    },
  },

  // centre (destination)
  centerId: {
    type: String,
  },
  centerCode: {
    type: String,
  },

  // lieu de départ
  departureAddress: {
    type: String,
  },
  departureZip: {
    type: String,
  },
  departureCity: {
    type: String,
  },
  departureDepartment: {
    type: String,
  },
  departureRegion: {
    type: String,
  },

  // date de départ
  departureAt: {
    type: Date,
  },
  departureAtString: {
    type: String,
  },
  realDepartureAtString: {
    type: String,
  },
  // date de retour
  returnAt: {
    type: Date,
  },
  returnAtString: {
    type: String,
  },
  realReturnAtString: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
