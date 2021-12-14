const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");

const esClient = require("../es");

const MODELNAME = "tag";

const Schema = new mongoose.Schema({
  zammadId: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
