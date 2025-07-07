const mongoose = require("mongoose");

const MODELNAME = "shortcut";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  keyword: {
    type: [String],
  },
  status: {
    type: Boolean,
    default: true,
  },
  text: {
    type: String,
    required: true,
    description: "html text",
  },
  content: {
    type: {},
    documentation: {
      description: "Contenu d'un shortcut dans un format lisible par Slate.js",
    },
  },
  dest: {
    type: [String],
    documentation: {
      description: "Liste du groupe de destinataires du shortcut",
    },
  },
  isSignature: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Détermine si le shortcut est une signature automatique de message",
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
  userRole: {
    type: String,
    required: true,
    enum: ["AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION"],
    documentation: {
      description: "Rôle de l'agent qui utilise le module de texte",
    },
  },
  userDepartment: {
    type: String,
    documentation: {
      description: "Département de l'utilisateur qui utilise le module de texte",
    },
  },
  userRegion: {
    type: String,
    documentation: {
      description: "Région de l'utilisateur qui utilise le module de texte",
    },
  },
  userVisibility: {
    type: String,
    enum: ["ALL", "AGENT"],
    default: "ALL",
    documentation: {
      description: "Visibilité du module de texte pour uniquement les agents ou pour agents et référents ",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
