const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const anonymize = require("../../anonymization/PlanDeTransport/ligneBus");

const MODELNAME = "lignebus";

const BusTeam = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    documentation: {
      description: "Role de l'accompagnant",
    },
  },
  lastName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de l'accompagnant",
    },
  },
  firstName: {
    type: String,
    required: true,
    documentation: {
      description: "Prenom de l'accompagnant",
    },
  },
  birthdate: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de naissance de l'accompagnant",
    },
  },
  mail: {
    type: String,
    required: true,
    documentation: {
      description: "Email de l'accompagnant",
    },
  },
  phone: {
    type: String,
    required: true,
    documentation: {
      description: "Numéro de téléphone de l'accompagnant",
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
    enum: getCohortNames(),
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
  classeId: {
    type: String,
    documentation: {
      description: "Id de la classe",
    },
  },

  meetingPointsIds: {
    type: [String],
    required: true,
    documentation: {
      description: "Liste des points de rassemblement",
    },
  },

  team: {
    type: [BusTeam],
    documentation: {
      description: "Liste des accompagnateurs du bus",
    },
  },
  delayedForth: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La ligne est retardée à l'allée",
    },
  },
  delayedBack: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La ligne est retardée au Retour",
    },
  },
  mergedBusIds: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des lignes de bus fusionnées",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

Schema.methods.anonymise = function () {
  return anonymize(this);
};

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

Schema.index({ cohort: 1 });
Schema.index({ cohort: 1, busId: 1 }, { unique: true });

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
