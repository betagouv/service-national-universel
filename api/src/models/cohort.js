const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "cohort";

const DSNJExportDates = new mongoose.Schema({
  cohesionCenters: Date,
  youngsBeforeSession: Date,
  youngsAfterSession: Date,
});

const Schema = new mongoose.Schema({
  snuId: {
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

  isAssignmentAnnouncementsOpenForYoung: {
    type: Boolean,
    documentation: {
      description:
        "Si true, les affectations sont 'révélées' au jeune. Sinon, le jeune doit avoir l'impression qu'il est toujours dans un état d'attente d'affectation même si il a été affecté.",
    },
  },
  manualAffectionOpenForReferent: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents régionaux peuvent manuellement affecter un jeune à un centre",
    },
  },

  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
