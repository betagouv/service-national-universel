const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const { esClient } = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const MODELNAME = "tablederepartition";

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    required: true,
    enum: getCohortNames(),
    documentation: {
      description: "Cohorte",
    },
  },
  fromDepartment: {
    type: String,
    documentation: {
      description: "Département d'origine",
    },
  },
  fromRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Région d'origine",
    },
  },
  toRegion: {
    type: String,
    documentation: {
      description: "Région de destination",
    },
  },
  toDepartment: {
    type: String,
    documentation: {
      description: "Département de destination",
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

Schema.plugin(mongooseElastic(esClient()), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
