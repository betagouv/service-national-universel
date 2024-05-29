const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const { esClient } = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const MODELNAME = "lignetopoint";

const Schema = new mongoose.Schema({
  lineId: {
    type: String,
    required: true,
    documentation: {
      description: "ID de la ligne de bus",
    },
  },

  meetingPointId: {
    type: String,
    required: true,
    documentation: {
      description: "ID du point de rassemblement",
    },
  },

  busArrivalHour: {
    type: String,
    documentation: {
      description: "Heure d'arrivée du bus",
    },
  },

  departureHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de départ",
    },
  },

  meetingHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de convocation",
    },
  },

  returnHour: {
    type: String,
    required: true,
    documentation: {
      description: "Heure de retour",
    },
  },

  transportType: {
    type: String,
    required: true,
    enum: ["train", "bus", "fusée", "avion"],
    documentation: {
      description: "Type de transport",
    },
  },

  stepPoints: {
    type: [
      {
        type: {
          type: String,
          enum: ["aller", "retour"],
          documentation: {
            description: "Correspondance aller ou correspondance retour",
          },
        },
        address: {
          type: String,
          documentation: {
            description: "Adresse du point d'étape",
          },
        },
        departureHour: {
          type: String,
          documentation: {
            description: "Heure de départ du point d'étape",
          },
        },
        returnHour: {
          type: String,
          documentation: {
            description: "Heure de retour du point d'étape",
          },
        },
        transportType: {
          type: String,
          enum: ["train", "bus", "fusée", "avion"],
          documentation: {
            description: "Type de transport du point d'étape",
          },
        },
      },
    ],
    documentation: {
      description: "Point d'étape",
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

Schema.plugin(mongooseElastic(esClient()), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
