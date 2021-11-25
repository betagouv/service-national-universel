const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const { SUPPORT_ROLES_LIST } = require("snu-lib/roles");

const MODELNAME = "knowledgeBase";

const Schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["section", "answer"],
      documentation: {
        description: "Une section peut contenir des réponses et d'autres sections, une réponse est inclue dans une section",
      },
    },
    parentId: {
      type: mongoose.Types.ObjectId,
      ref: "knowledgeBase",
      required: true,
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
    title: {
      type: String,
      required: true,
      documentation: {
        description: "Soit le titre d'une section, soit le titre d'un article",
      },
    },
    slug: {
      type: String,
      required: true,
      documentation: {
        description: "Le slug pour l'url de l'élément'",
      },
    },
    content: {
      type: String,
      documentation: {
        description: "ontenu d'un article",
      },
    },
    description: {
      type: String,
      documentation: {
        description: "Description de l'élément",
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
    allowedRoles: {
      type: String,
      enum: SUPPORT_ROLES_LIST,
      required: true,
      documentation: {
        description: "Rôles délimitant le droit de lecture d'une réponse",
      },
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
      ref: "referent",
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
  },
  { timestamps: true }
);

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
Schema.plugin(mongooseElastic(esClient), MODELNAME);

module.exports = mongoose.model(MODELNAME, Schema);
