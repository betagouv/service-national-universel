const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");

const esClient = require("../es");

const MODELNAME = "tag";

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // zammad migration
    zammadId: {
      type: String,
    },
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
