const mongoose = require("mongoose");
const patchHistory = require("mongoose-patch-history").default;
const MODELNAME = "sessionphase1token";

const Schema = new mongoose.Schema({
  token: {
    type: String,
    documentation: {
      description: "Token de session publique",
    },
  },

  startAt: {
    type: Date,
    documentation: {
      description: "Date de debut validité du token",
    },
  },

  expireAt: {
    type: Date,
    documentation: {
      description: "Date de fin validité du token",
    },
  },

  sessionId: {
    type: String,
    documentation: {
      description: "Id de session",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
