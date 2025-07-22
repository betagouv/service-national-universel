const mongoose = require("mongoose");

const MODELNAME = "knowledgebase";

const Schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["section", "article"],
      documentation: {
        description: "Une section peut contenir des réponses et d'autres sections, une réponse est inclue dans une section",
      },
    },
    parentId: {
      type: mongoose.Types.ObjectId,
      ref: "knowledgebase",
      documentation: {
        description: "Lien de parenté entre un article/une section et une section",
      },
    },
    position: {
      type: Number,
      required: true,
      documentation: {
        description: "Position d'un élément au sein de sa section",
      },
    },
    group: {
      type: String,
      trim: true,
      documentation: {
        description: "Phase 1, Phase 2, Mon compte...",
      },
    },
    title: {
      type: String,
      trim: true,
      required: true,
      documentation: {
        description: "Soit le titre d'une section, soit le titre d'un article",
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      documentation: {
        description: "Le slug pour l'url de l'élément'",
      },
    },
    content: {
      type: {},
      documentation: {
        description: "Contenu d'un article dans un format lisible par Slate.js",
      },
    },
    contentAsText: {
      type: String,
      documentation: {
        description: "Contenu d'un article en texte pur pour être requêté par elastic search",
      },
    },
    description: {
      type: String,
      documentation: {
        description: "Description de l'élément",
      },
    },
    keywords: {
      type: String,
      documentation: {
        description: "Mots clés",
      },
    },
    imageSrc: {
      type: String,
      documentation: {
        description: "Url de l'image",
      },
    },
    imageAlt: {
      type: String,
      documentation: {
        description: "Description de l'image",
      },
    },
    icon: {
      type: String,
      documentation: {
        description: "Icône si pas d'image",
      },
    },
    allowedRoles: {
      type: [
        {
          type: String,
          required: true,
          documentation: {
            description: "Rôles délimitant le droit de lecture d'une réponse",
          },
        },
      ],
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      required: true,
      documentation: {
        description: "Un élément peut être en brouillon, publié ou archivé",
      },
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "agent",
      required: true,
    },
    read: {
      type: Number,
      required: true,
      default: 0,
      documentation: {
        description: "Nombre de vues d'une réponse",
      },
    },
    createdAt: { type: Date, default: Date.now, required: true },
    searched: {
      type: Number,
      required: true,
      default: 0,
      documentation: {
        description: "Nombre de d'apparition dans le moteur de recherche",
      },
    },
    // used for tracking content updates
    // (instead of patch history that generates a lot of data for the content updates)
    contentUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, email, firstName, lastName, model } = user;
    this._user = { _id, role, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.user = params?.fromUser;
  next();
});

module.exports = mongoose.model(MODELNAME, Schema);
