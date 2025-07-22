const mongoose = require("mongoose");

const MODELNAME = "folder";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  folderIndex: {
    type: Number,
  },
  userRole: {
    type: String,
    required: true,
    enum: ["AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION"],
    documentation: {
      description: "Rôle de l'agent qui utilise le dossier",
    },
  },
  isMandatoryReferent: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Indique si le dossier est obligatoire pour les référents (ex: dossier de phase)",
    },
  },
  userDepartment: {
    type: String,
    documentation: {
      description: "Département de l'utilisateur qui utilise le dossier",
    },
  },
  userRegion: {
    type: String,
    documentation: {
      description: "Région de l'utilisateur qui utilise le dossier",
    },
  },
  abbreviation: {
    type: String,
    documentation: {
      description: "Abbreviation du nom du dossier",
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
