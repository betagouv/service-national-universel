const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../ElasticSearch");

const MODELNAME = "schoolramses";

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

Schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["data"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = OBJ;
