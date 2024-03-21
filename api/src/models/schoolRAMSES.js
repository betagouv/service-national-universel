const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "schoolramses";
const patchHistory = require("mongoose-patch-history").default;

const Schema = new mongoose.Schema(
  {
    uai: { type: String },
    fullName: { type: String },
    postcode: { type: String },
    type: { type: String },
    departmentName: { type: String },
    region: { type: String },
    city: { type: String },
    country: { type: String },
    adresse: { type: String },
    department: { type: String },
    codeCity: { type: String },
    codePays: { type: String },
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

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

Schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["data"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = OBJ;
