const mongoose = require("mongoose");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const MODELNAME = "importplandetransport";

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    required: true,
    enum: getCohortNames(),
    documentation: {
      description: "Cohorte",
    },
  },
  lines: {
    type: [Object],
    documentation: {
      description: "Détails des lignes de bus (on ne définit pas l'intérieur pour plus de malléabilité sur l'import",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.user = params?.fromUser;
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

// Schema.plugin(mongooseElastic(esClient()), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
