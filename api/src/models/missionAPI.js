const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const MODELNAME = "missionapi";

const Schema = new mongoose.Schema({
  title: {
    type: String,
    documentation: {
      description: "Titre de la mission",
    },
  }, // OK
  domain: {
    type: String,
    documentation: {
      description: "Domaine de la mission (citoyenneté, sport, culture, ...)",
    },
  }, // OK

  startAt: {
    type: Date,
    documentation: {
      description: "Date du début de la mission",
    },
  }, // OK
  endAt: {
    type: Date,
    documentation: {
      description: "Date de fin de la mission",
    },
  }, // OK
  format: {
    type: String,
    default: "CONTINUOUS",
    enum: ["CONTINUOUS", "DISCONTINUOUS", "AUTONOMOUS"],
    documentation: {
      description: "Format de la mission",
    },
  },

  places: {
    type: Number,
    default: 1,
    documentation: {
      description: "Nombre de places total pour cette mission",
    },
  }, // OK
  description: {
    type: String,
    documentation: {
      description: "Description de la mission",
    },
  }, // OK

  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure proposant la mission",
    },
  }, // OK
  structureName: {
    type: String,
    documentation: {
      description: "Nom de la structure proposant la mission",
    },
  }, // OK ( slave data from structure)

  status: {
    type: String,
    default: "DRAFT",
    enum: ["DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED"],
    documentation: {
      description: "Statut de la mission",
    },
  },

  tutorId: {
    type: String,
    documentation: {
      description: "Identifiant de l'utilisateur tuteur de la mission",
    },
  },
  tutorName: {
    type: String,
    documentation: {
      description: "Prénom et nom de l'utilisateur tuteur de la mission",
    },
  },

  adresse: {
    type: String,
    documentation: {
      description: "Adresse du lieu où se déroule la mission",
    },
  },
  postalCode: {
    type: String,
    documentation: {
      description: "Code postal du lieu où se déroule la mission",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville où se déroule la mission",
    },
  },
  departmentName: {
    type: String,
    documentation: {
      description: "Département où se déroule la mission",
    },
  },
  departmentCode: {
    type: String,
    documentation: {
      description: "Département où se déroule la mission",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région où se déroule la mission",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "",
    },
  },
  location: {
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
  },
  remote: {
    type: String,
    documentation: {
      description: "La mission peut se réaliser à distance",
    },
  },

  organizationName: { type: String },
  applicationUrl: { type: String },
  publisherName: { type: String },
  publisherUrl: { type: String },

  lastSyncAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
