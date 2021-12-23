const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "sessionphase1";

const Schema = new mongoose.Schema({
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion",
    },
  },
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021", "2020", "2019"],
    documentation: {
      description: "Cohorte",
    },
  },
  headCenterId: {
    type: String,
    documentation: {
      description: "Id de l'utilisateur responsable, le chef de centre",
    },
  },
  team: {
    type: [
      {
        firstName: {
          type: String,
          description: "prénom du membre de l'équipe",
        },
        lastName: {
          type: String,
          description: "nom du membre de l'équipe",
        },
        role: {
          type: String,
          description: "role du membre de l'équipe",
        },
        email: {
          type: String,
          description: "email du membre de l'équipe",
        },
        phone: {
          type: String,
          description: "téléphone du membre de l'équipe",
        },
      },
    ],
    documentation: {
      description: "equipe d'encadrement pour le séjour",
    },
  },

  waitingList: {
    type: [String],
    documentation: {
      description: "Liste  des jeunes en liste d'attente sur ce séjour de cohésion",
    },
  },

  placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
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
});

Schema.plugin(mongooseElastic(esClient, { ignore: ["team"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
