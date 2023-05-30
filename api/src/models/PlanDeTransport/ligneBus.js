const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { COHORTS } = require("snu-lib");
const MODELNAME = "lignebus";

const Leader = new mongoose.Schema({
  lastName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du chef de file",
    },
  },
  firstName: {
    type: String,
    required: true,
    documentation: {
      description: "Prenom du chef de file",
    },
  },
  birthdate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de naissance du chef de file",
    },
  },
  mail: {
    type: String,
    required: true,
    documentation: {
      description: "Email du chef de file",
    },
  },
  phone: {
    type: String,
    required: true,
    documentation: {
      description: "Numéro de téléphone du chef de file",
    },
  },
  forth: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par l'aller",
    },
  },
  back: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par le retour",
    },
  },
});

const BusSupervisor = new mongoose.Schema({
  lastName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de l'encadrant",
    },
  },
  firstName: {
    type: String,
    required: true,
    documentation: {
      description: "Prenom de l'encadrant",
    },
  },
  birthdate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de naissance de l'encadrant",
    },
  },
  mail: {
    type: String,
    required: true,
    documentation: {
      description: "Email de l'encadrant",
    },
  },
  phone: {
    type: String,
    required: true,
    documentation: {
      description: "Numéro de téléphone de l'encadrant",
    },
  },
  forth: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par l'aller",
    },
  },
  back: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Concerné par le retour",
    },
  },
});

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    required: true,
    enum: COHORTS,
    documentation: {
      description: "Cohorte de la ligne de bus",
    },
  },

  busId: {
    type: String,
    required: true,
    documentation: {
      description: "Numero de bus",
    },
  },

  departuredDate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de départ",
    },
  },

  returnDate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de retour",
    },
  },

  youngCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité de jeunes",
    },
  },

  totalCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité totale",
    },
  },

  followerCapacity: {
    type: Number,
    required: true,
    documentation: {
      description: "Capacité d'accompagnateurs",
    },
  },

  youngSeatsTaken: {
    type: Number,
    required: true,
    default: 0,
    documentation: {
      description: "Nombre de jeunes",
    },
  },

  travelTime: {
    type: String,
    required: true,
    documentation: {
      description: "Temps de route",
    },
  },

  lunchBreak: {
    type: Boolean,
    documentation: {
      description: "Pause déjeuner aller",
    },
  },

  lunchBreakReturn: {
    type: Boolean,
    documentation: {
      description: "Pause déjeuner retour",
    },
  },

  sessionId: {
    type: String,
    required: true,
    documentation: {
      description: "Session",
    },
  },

  centerId: {
    type: String,
    required: true,
    documentation: {
      description: "Centre de destination",
    },
  },

  centerArrivalTime: {
    type: String,
    required: true,
    documentation: {
      description: "Heure d'arrivée au centre",
    },
  },

  centerDepartureTime: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de départ du centre",
    },
  },

  meetingPointsIds: {
    type: [String],
    required: true,
    documentation: {
      description: "Liste des points de rassemblement",
    },
  },

  leader: {
    type: [Leader],
    documentation: {
      description: "Informations du Chef de File",
    },
  },

  BusSupervisor: {
    type: [BusSupervisor],
    documentation: {
      description: "Informations des encadrants",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.user = params?.fromUser;
  this.updatedAt = Date.now();
  next();
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
