const mongoose = require("mongoose");
const patchHistory = require("mongoose-patch-history").default;

const MODELNAME = "filter";

const Schema = new mongoose.Schema({
  userId: {
    type: String,
  },
  url: {
    type: String,
    documentation: {
      description: "Url contenant tous les filtres preselectionnés",
    },
  },
  page: {
    type: String,
    documentation: {
      description: "Page sur laquelle se trouve le filtre",
    },
  },
  name: {
    type: String,
    documentation: {
      description: "Nom de la sauvegarde des filtres",
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

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
