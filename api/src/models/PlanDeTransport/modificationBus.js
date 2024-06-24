const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const anonymize = require("../../anonymization/PlanDeTransport/modificationBus");

const MODELNAME = "modificationbus";

const Schema = new mongoose.Schema({
  cohort: {
    type: String,
    required: true,
    enum: getCohortNames(),
    documentation: {
      description: "Cohorte de la ligne de bus",
    },
  },
  //Informations de la ligne de bus
  lineId: {
    type: String,
    required: true,
    documentation: {
      description: "Id de la ligne de bus",
    },
  },

  lineName: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de la ligne de bus",
    },
  },

  // Informations de la demande
  requestMessage: {
    type: String,
    required: true,
    documentation: {
      description: "Message de la demande de modification",
    },
  },

  requestUserId: {
    type: String,
    required: true,
    documentation: {
      description: "Id de l'utilisateur ayant fait la demande",
    },
  },

  requestUserName: {
    type: String,
    required: true,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant fait la demande",
    },
  },

  requestUserRole: {
    type: String,
    required: true,
    documentation: {
      description: "Rôle de l'utilisateur ayant fait la demande",
    },
  },

  tagIds: {
    type: [String],
    required: false,
    documentation: {
      description: "Id des tags de la demande",
    },
  },

  // Informations de la modification sur le statut de la demande (pour es)
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    documentation: {
      description: "Statut de la demande",
    },
  },

  statusUserId: {
    type: String,
    required: false,
    documentation: {
      description: "Id de l'utilisateur ayant changé le statut de la demande",
    },
  },

  statusUserName: {
    type: String,
    required: false,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant changé le statut de la demande",
    },
  },

  statusDate: {
    type: Date,
    required: false,
    documentation: {
      description: "Date du changement de statut de la demande",
    },
  },

  // Informations de la modification sur l'avis de la demande (pour es)
  opinion: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Avis sur la demande",
    },
  },

  opinionUserId: {
    type: String,
    required: false,
    documentation: {
      description: "Id de l'utilisateur ayant donné son avis sur la demande",
    },
  },

  opinionUserName: {
    type: String,
    required: false,
    documentation: {
      description: "Prénom / nom de l'utilisateur ayant donné son avis sur la demande",
    },
  },

  opinionDate: {
    type: Date,
    required: false,
    documentation: {
      description: "Date de l'avis sur la demande",
    },
  },

  messages: {
    type: [
      {
        message: {
          type: String,
          documentation: {
            description: "Message",
          },
        },
        userId: {
          type: String,
          required: true,
          documentation: {
            description: "Id de l'utilisateur ayant envoyé le message / avis",
          },
        },
        userName: {
          type: String,
          required: true,
          documentation: {
            description: "Prénom / nom de l'utilisateur ayant envoyé le message / avis",
          },
        },
        date: {
          type: Date,
          required: true,
          documentation: {
            description: "Date du message / avis",
          },
        },
      },
    ],
    required: false,
    documentation: {
      description: "Conversation sur la demande",
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

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
module.exports.Schema = Schema;
