const mongoose = require("mongoose");

const MODELNAME = "tag";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userVisibility: {
    type: String,
    enum: ["ALL", "AGENT"],
    default: "AGENT",
    documentation: {
      description: "Visibilité du tag pour uniquement les agents ou pour agents et référents ",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création du tag",
    },
  },
  deletedAt: {
    type: Date,
    default: null,
    documentation: {
      description: "Date de suppression du tag",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
