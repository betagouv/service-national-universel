const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { COHORTS } = require("snu-lib");
const ModificationBusSchema = require("./modificationBus").Schema;
const PointDeRassemblementSchema = require("./pointDeRassemblement").Schema;
const SessionPhase1Schema = require("../sessionPhase1").Schema;
const CohesionCenterSchema = require("../cohesionCenter").Schema;
const MODELNAME = "plandetransport";

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

  youngCount: {
    type: Number,
    required: true,
    documentation: {
      description: "Nombre de jeunes",
    },
  },

  tauxDeRemplissage: {
    type: Number,
    documentation: {
      description: "Taux de remplissage de la ligne",
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

  // session: {
  //   type: SessionPhase1Schema,
  //   required: true,
  //   documentation: {
  //     description: "Session",
  //   },
  // },

  centerId: {
    type: String,
    required: true,
    documentation: {
      description: "ID du centre",
    },
  },

  centerRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Region du centre",
    },
  },

  centerDepartment: {
    type: String,
    required: true,
    documentation: {
      description: "Region du centre",
    },
  },

  centerName: {
    type: String,
    required: true,
    documentation: {
      description: "Region du centre",
    },
  },

  centerCode: {
    type: String,
    // required: true,
    documentation: {
      description: "Region du centre",
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

  // ! Récuperer tous les champs utiles
  // ! Regarder comment choper l'id !
  // ! Solution arrayOfMeetingpointsObjectId
  pointDeRassemblements: {
    type: [PointDeRassemblementSchema],
    required: true,
    documentation: {
      description: "Liste des points de rassemblement",
    },
  },

  // ! Récuperer tous les champs utiles
  modificationBuses: {
    type: [ModificationBusSchema],
    required: true,
    documentation: {
      description: "Liste des modifications de lignes",
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
