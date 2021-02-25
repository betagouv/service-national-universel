const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "school";

const Schema = new mongoose.Schema(
  {
    name1: { type: String },
    name2: { type: String },
    postcode: { type: String },
    city: { type: String },
    department: { type: String },
    type: { type: String },
  },
  { timestamps: true }
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

Schema.index({ postcode: 1, name2: 1 }, { unique: true });

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
