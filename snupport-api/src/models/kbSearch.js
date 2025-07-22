const mongoose = require("mongoose");

const MODELNAME = "kbsearch";

const Schema = new mongoose.Schema({
  search: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  resultsNumber: {
    type: Number,
  },
  role: {
    type: String,
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
