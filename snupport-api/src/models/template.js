const mongoose = require("mongoose");

const MODELNAME = "template";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Titre du modèle de ticket",
    },
  },
  description: {
    type: String,
    required: true,
    documentation: {
      description: "Description du modèle de ticket",
    },
  },
  subject: {
    type: String,
    documentation: {
      description: "Sujet du ticket",
    },
  },
  message: {
    type: String,
    required: true,
    documentation: {
      description: "Message de brouillon enregistré",
    },
  },
  tags: {
    type: [mongoose.Types.ObjectId],
    ref: "tag",
    documentation: {
      description: "Etiquettes reliées au ticket",
    },
  },
  canal: {
    type: String,
    enum: ["MAIL", "PLATFORM"],
    documentation: {
      description: "canal de communication d'envoi du ticket",
    },
    required: true,
  },

  attributedTo: { type: mongoose.Types.ObjectId, ref: "agent" },

  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: "agent", required: true },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
