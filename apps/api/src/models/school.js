const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "school";

const Schema = new mongoose.Schema(
  {
    version: { type: String },
    uai: { type: String },
    name1: { type: String },
    name2: { type: String },
    fullName: { type: String },
    postcode: { type: String },
    city: { type: String },
    department: { type: String },
    type: { type: String },
    country: { type: String, default: "France" },
    apiAdressObject: mongoose.Schema.Types.Mixed,
    csvObject: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient, { ignore: ["apiAdressObject", "csvObject"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);

OBJ.syncIndexes(); // Remove existing index

module.exports = OBJ;
