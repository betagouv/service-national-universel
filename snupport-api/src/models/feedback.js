const mongoose = require("mongoose");

const MODELNAME = "feedback";

const Schema = new mongoose.Schema({
  knowledgeBaseArticle: {
    type: mongoose.Types.ObjectId,
    ref: "knowledgeBase",
    required: true,
    documentation: {
      description: "Article de la knowledgeBase",
    },
  },
  isPositive: {
    type: Boolean,
    required: true,
    documentation: {
      description: "Avis de l'utilisateur",
    },
  },
  comment: {
    type: String,
    documentation: {
      description: "Commentaire de l'utilisateur",
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "contact",
    required: false,
    documentation: {
      description: "Contact ayant créé le feedback",
    },
  },
  treatedAt: { type: Date },
  treatedBy: {
    type: mongoose.Types.ObjectId,
    ref: "agent",
  },
});

module.exports = mongoose.model(MODELNAME, Schema);
