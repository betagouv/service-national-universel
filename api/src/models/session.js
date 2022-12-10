const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "session";

const DSNJExportDates = new mongoose.Schema({
  cohesionCenters: Date,
  youngsBeforeSession: Date,
  youngsAfterSession: Date,
});

const Schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte id (defined in snu lib)",
    },
  },
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte name (defined in snu lib)",
    },
  },
  dsnjExportDates: {
    type: DSNJExportDates,
    documentation: {
      description: "Dates when DSNJ export are generated",
    },
  },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.pre("save", function (next, params) {
  this.updatedAt = Date.now();
  next();
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
