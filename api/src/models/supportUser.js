const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "support_user";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      documentation: {
        description: "Nom du dossier",
      },
    },
    tickets: [
      {
        type: mongoose.Types.ObjectId,
        ref: "ticket",
        documentation: {
          description: "Tickets manuellement déposés dans le dossier",
        },
      },
    ],
    filters: {
      type: [
        {
          field: { type: String },
          criteria: { type: String, enum: ["$ne", "$eq", "$gt", "$gte", "$lt", "$;te"] },
        },
      ],
      documentation: {
        description: "Filtres appliqués au dossier",
      },
    },
    // cache
    totalTickets: {
      type: Number,
      documentation: {
        description: "Nombre de tickets enregistré en cache pour affichage dans la plateforme",
      },
    },
  },
  { timestamps: true },
);

// because properties for support user have nothing to do with referent and SNU project
// because the support is also supposed to belong to other projects at some point
// we create a new model for support user with a schema only for support

const Schema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
      documentation: {
        description: "Same ID as the user ID in the project",
      },
    },
    projectUserId: {
      type: String,
      index: true,
      documentation: {
        description: "Identifiant de l'utilisateur dans le projet",
      },
    },
    status: {
      type: String,
      enum: ["active", "deleted", "inactive", ""],
      default: "active",
      documentation: {
        description: "Status de l'utilisateur",
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
    filters: {
      type: [
        {
          field: { type: String },
          criteria: { type: String, enum: ["$ne", "$eq", "$gt", "$gte", "$lt", "$;te"] },
        },
      ],
      documentation: {
        description: "Filtres appliqués à l'utilisateur",
      },
    },
    folders: [folderSchema],
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

module.exports = mongoose.model(MODELNAME, Schema);
