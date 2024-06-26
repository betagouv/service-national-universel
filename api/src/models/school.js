const mongoose = require("mongoose");

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

const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = OBJ;
