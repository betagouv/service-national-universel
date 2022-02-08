const mongoose = require("mongoose");

const MODELNAME = "area";

// This object is used to get the density of a city and assign it to a young

const Schema = new mongoose.Schema({
  cityCode: {
    type: String,
    documentation: {
      description: "Code commune. C'est pas le code postal ni le code INSE",
    },
  },

  density: {
    type: String,
    enum: ["TRES PEU DENSE", "PEU DENSE", "INTERMEDIAIRE", "DENSE"],
    documentation: {
      description: "",
    },
  },

  region: {
    type: String,
    documentation: {
      description: "",
    },
  },

  population: {
    type: Number,
    documentation: {
      description: "",
    },
  },

  name: {
    type: String,
    documentation: {
      description: "",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
