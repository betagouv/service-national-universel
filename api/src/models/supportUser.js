const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "supportUser";

const Schema = new mongoose.Schema(
  {
    rootId: {
      type: String,
      index: true,
      documentation: {
        description: "Identifiant dans le projet",
      },
    },
    firstName: {
      type: String,
      documentation: {
        description: "Prénom de l'utilisateur",
      },
    },
    lastName: {
      type: String,
      documentation: {
        description: "Nom de l'utilisateur",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      documentation: {
        description: "Email de l'utilisateur",
      },
    },
    lastLoginAt: {
      type: Date,
      documentation: {
        description: "Date de dernière connexion",
      },
    },

    registerdAt: {
      type: Date,
      documentation: {
        description: "Date de création",
      },
    },

    role: {
      type: String,
      enum: ["admin", "referent", "structure", "visitor"],
      documentation: {
        description: "Rôle de l'utilisateur dans le support",
      },
    },
    folders: [
      new mongoose.Schema({
        name: {
          type: String,
          documentation: {
            description: "Nom du dossier",
          },
        },
        filters: [
          {
            type: {
              type: String,
              enum: ["tag", "canal", "department", "external", "status", "department", "region", "academy", "addressedToAgent", "category", "title"],
            },
          },
        ],
        tags: [
          {
            tag: {
              type: String,
              documentation: {
                description: "Tous les tickets avec ces tags seront inclus dans ce dossier",
              },
            },
            criteria: {
              type: String,
              enum: ["$ne", "$eq"],
            },
          },
        ],
        canals: [
          {
            canal: {
              type: String,
              documentation: {
                description: "Tous les tickets avec ce canal seront inclus dans ce dossier",
              },
            },
            criteria: {
              type: String,
              enum: ["$ne", "$eq"],
            },
          },
        ],
        department: [
          {
            canal: {
              type: String,
              documentation: {
                description: "Tous les tickets avec ce canal seront inclus dans ce dossier",
              },
            },
            criteria: {
              type: String,
              enum: ["$ne", "$eq"],
            },
          },
        ],
        tickets: {
          type: [{ type: mongoose.Types.ObjectId, ref: "ticket" }],
          documentation: {
            description: "Tickets manuellement déposés dans le dossier",
          },
        },
        // cache
        totalTickets: {
          type: Number,
          documentation: {},
        },
      }),
    ],
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

module.exports = mongoose.model(MODELNAME, Schema);
