const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const { getCohortNames } = require("snu-lib");
const patchHistory = require("mongoose-patch-history").default;

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
  academy: {
    type: String,
    documentation: {
      description: "Nom de l'académie (peut être déduit du département)",
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
    enum: getCohortNames(true, false, true),
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

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
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
