const mongoose = require("mongoose");

const MODELNAME = "organisation";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    documentation: {
      description: "Organisation",
    },
  },
  attributes: {
    type: [{ name: String, value: String, format: String }],
  },
  imapConfig: {
    type: [{ user: String, password: String, host: String, port: String, tls: Boolean, tlsOptions: { secureProtocol: String }, lastFetch: Date }],
  },
  createdAt: { type: Date, default: Date.now, required: true },
  spamEmails: {
    type: [String],
  },
  apikey: {
    type: String,
  },
  knowledgeBaseBaseUrl: {
    type: String,
    documentation: {
      description:
        "L'organisation peut avoir sa propre URL pour la BDC, c'est elle qui sera insérée lorsque des liens vers d'autres articles intra-BDC, ou des liens depuis les tickets (optionnel)",
    },
  },
  knowledgeBaseRoles: {
    type: [
      {
        type: String,
        validate: {
          validator: (v) => /^[a-z0-9_]+$/.test(v),
          message: "Le rôle doit être en minuscule, sans espace, sans caractère spécial",
        },
      },
    ],
    documentation: {
      description: "L'organisation peut restreindre des articles à certains rôles (optionnel)",
    },
  },
});

module.exports = mongoose.model(MODELNAME, Schema);
