const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const MODELNAME = "program";

const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  imageFile: { type: String }, //todo
  type: { type: String },

  department: { type: String },
  region: { type: String },
  isNational: { type: String, enum: ["true", "false"] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
