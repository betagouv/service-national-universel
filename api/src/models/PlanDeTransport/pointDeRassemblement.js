const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const { esClient } = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const MODELNAME = "pointderassemblement";

const Schema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Code du point de rassemblement",
    },
  },

  cohorts: {
    type: [String],
    required: true,
    enum: getCohortNames(),
    documentation: {
      description: "Cohorte du point de rassemblement",
    },
  },

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du point de rassemblement",
    },
  },

  address: {
    type: String,
    required: true,
    documentation: {
      description: "Adresse du point de rassemblement",
    },
  },

  complementAddress: {
    type: [
      {
        cohort: {
          type: String,
          enum: getCohortNames(),
          documentation: {
            description: "Cohorte du complément d'adresse",
          },
        },
        complement: {
          type: String,
          documentation: {
            description: "Complément d'adresse",
          },
        },
      },
    ],
    documentation: {
      description: "Complément d'adresse du point de rassemblement",
    },
  },

  city: {
    type: String,
    required: true,
    documentation: {
      description: "Ville du point de rassemblement",
    },
  },

  zip: {
    type: String,
    required: true,
    documentation: {
      description: "Code postal du point de rassemblement",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département du point de rassemblement",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région du point de rassemblement",
    },
  },

  location: {
    lat: { type: Number },
    lon: { type: Number },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
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
