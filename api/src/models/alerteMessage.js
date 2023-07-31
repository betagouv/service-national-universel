const { string } = require("joi");
const mongoose = require("mongoose");
const { ROLES_LIST } = require("snu-lib");

const MODELNAME = "alerteMessage";

const Schema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ["normal", "important", "urgent"],
    required: true,
    documentation: {
      description: "Niveau de priorité du message.",
    },
  },
  to_role: {
    type: [String],
    enum: ROLES_LIST,
    required: true,
    documentation: {
      description: "Destinateire(s) du message",
    },
  },
  content: {
    type: String,
    maxLength: 1000,
    required: true,
    documentation: {
      description: "Contenu du message",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création du message",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
