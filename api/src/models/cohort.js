const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const patchHistory = require("mongoose-patch-history").default;

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
  manualAffectionOpenForAdmin: {
    type: Boolean,
    documentation: {
      description: "Si true, les admins peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentRegion: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents régionaux peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentDepartment: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents départementaux peuvent manuellement affecter un jeune à un centre",
    },
  },

  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  pdrChoiceLimitDate: {
    type: Date,
    documentation: {
      description: "Date limite de choix du PDR par le jeune",
    },
  },

  validationDate: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation du jeune (apèrs cette date, sa phase 1 est validée)",
    },
  },
  validationDateForTerminaleGrade: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation d'un jeune en terminale (apèrs cette date, sa phase 1 est validée)",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
