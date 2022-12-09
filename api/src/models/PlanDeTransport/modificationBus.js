const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const patchHistory = require("mongoose-patch-history").default;
const MODELNAME = "modificationbus";

const Schema = new mongoose.Schema({
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

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "rejected"],
    documentation: {
      description: "Statut de la demande",
    },
  },

  tags: {
    type: [String],
    required: false,
    documentation: {
      description: "Id des tags de la demande",
    },
  },

  date: {
    type: Date,
    required: true,
    documentation: {
      description: "Date de la demande",
    },
  },

  conversation: {
    type: [
      {
        type: {
          type: String,
          required: true,
          enum: ["message", "opinion"],
          documentation: {
            description: "Type de message",
          },
        },
        message: {
          type: String,
          documentation: {
            description: "Message",
          },
        },
        opinion: {
          type: String,
          enum: ["favorable", "unfavorable"],
          documentation: {
            description: "Avis sur la demande",
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
        userRole: {
          type: String,
          required: true,
          documentation: {
            description: "Rôle de l'utilisateur ayant envoyé le message / avis",
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
