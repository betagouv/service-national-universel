const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es/");
const patchHistory = require("mongoose-patch-history").default;
const { ROLES_LIST } = require("snu-lib");

const MODELNAME = "alerteMessage";

const Schema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ["normal", "important", "urgent"],
    required: true,
    documentation: {
      description: "Niveau de priorité du message.",
    },
  },
  to_role: {
    type: [String],
    enum: ROLES_LIST,
    required: true,
    documentation: {
      description: "Destinateire(s) du message",
    },
  },
  title: {
    type: String,
    maxLength: 100,
    required: true,
    documentation: {
      description: "Titre du message",
    },
  },
  content: {
    type: String,
    maxLength: 1000,
    required: true,
    documentation: {
      description: "Contenu du message",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création du message",
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de la dernière modification du message",
    },
  },
  deletedAt: {
    type: Date,
    documentation: {
      description: "Date de suppression du message",
    },
  },
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

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
