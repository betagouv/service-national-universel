const mongoose = require("mongoose");

const MODELNAME = "contact";

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    documentation: {
      description: "Prénom de l'utilisateur",
    },
  },
  lastName: {
    type: String,
    documentation: {
      description: "Nom de l'utilisateur",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
    documentation: {
      description: "Email de l'utilisateur",
    },
  },
  region: {
    type: String,
  },
  department: {
    type: String,
  },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
  attributes: [{ format: String, value: String, name: String }],
});

module.exports = mongoose.model(MODELNAME, Schema);
