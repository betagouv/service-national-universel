const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");

const esClient = require("../es");

const MODELNAME = "ticket";

const Message = new mongoose.Schema({
  type: {
    type: String,
    documentation: {
      description: "D'où provient l'article (mail, chat, Facebook...)",
      // Not sure if it's relevant to keep this field : we already have a "fromCanal" field in the ticket Schema
    },
    emitterRole: {
      type: String,
      documentation: {
        description: "rôle de l'émetteur : agent, référent, volontaire..."
      },
    },
    createdByUserId: {
      type: mongoose.Types.ObjectId,
      ref: 'referent',
      required: true,
    },
    createdByYoungId: {
      type: mongoose.Types.ObjectId,
      ref: 'young',
      required: true,
    },
    contentType: {
      type: String,
    },
    body: {
      type: String,
      documentation: {
        description: "contenu du message"
      }
    },
    internal: {
      type: Boolean,
      documentation: {
        description: "le message est-il de visibilité interne"
      }
    },
  }
}, { timestamps: true });

const Schema = new mongoose.Schema({

  number: {
    type: [String],
    documentation: {
      description: "Numéro du ticket",
    },
  },
  title: {
    type: String,
    required: true,
    documentation: {
      description: "Objet du ticket",
    },
  }, // OK
  category: {
    type: String,
    enum: ["TECHNICAL", "QUESTION"],
    required: true,
    documentation: {
      description: "Catégorie du ticket",
    },
  }, // OK
  subject: {
    type: String,
    enum: ["DOWNLOAD", "UPLOAD", "ENGAGEMENT_CONTRACT", "OTHER", "PHASE_1", "PHASE_2", "PHASE_3", "LOGIN"],
    required: true,
    documentation: {
      description: "Sujet du ticket",
    },
  }, // OK
  emitterYoungId: {
    type: mongoose.Types.ObjectId,
    ref: 'young',
    required: true,
    documentation: {
      description: "Identifiant de l'émetteur volontaire",
    },
  }, // OK
  emitterUserId: {
    type: mongoose.Types.ObjectId,
    ref: 'referent',
    required: true,
    documentation: {
      description: "Identifiant de l'émetteur",
    },
  }, // OK
  emitterExternal: {
    type: Boolean,
    default: false,
  },
  addressedToAgent: {
    type: String,
    enum: ["AGENT_SUPPORT", "AGENT_TECHNICAL", "AGENT_DEPARTMENT_REFERENT", "AGENT_REGION_REFERENT"],
    required: true,
    documentation: {
      description: "L'agent (ou les agents) auquel est destiné le ticket",
    },
  }, // OK
  fromCanal: {
    type: String,
    enum: ["CANAL_FORM", "CANAL_PUBLIC_FORM", "CANAL_MAIL", "CANAL_CHAT", "CANAL_FACEBOOK", "CANAL_TWITTER"],
    required: true,
    documentation: {
      description: "canal de communication d'où provient le ticket",
    },
  }, // OK
  group: {
    type: String,
    enum: ["ADMIN", "CONTACT", "INSCRIPTION", "YOUNG", "REFERENT", "STRUCTURE", "VOLUNTEER"],
    documentation: {
      description: "nom du groupe",
    },
  }, // OK

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    documentation: {
      description: "nom du degré de priorité",
    },
  },
  state: {
    type: String,
    enum: ["NEW", "OPEN", "CLOSED", "PENDING_REMINDER", "PENDING_CLOSURE"],
    documentation: {
      description: "nom de l'état du ticket",
    },
  },

  firstResponseAt: {
    type: Date,
    documentation: {
      description: "date de la première réponse",
    },
  },

  lastContactEmitterAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "date de la dernière interaction de l'émetteur",
    },
  },

  lastContactAgentAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "date de la dernière interaction de l'agent",
    },
  },

  agentInChargeId: {
    type: mongoose.Types.ObjectId,
    ref: 'referent',
    documentation: {
      description: "identifiant de l'agent en charge du ticket",
    },
  },

  lastAgentInChargeUpdateAt: {
    type: mongoose.Types.ObjectId,
    ref: 'referent',
    documentation: {
      description: "dernière mise à jour de la part de l'agent en charge",
    },
  },

  lastUpdateById: {
    type: mongoose.Types.ObjectId,
    ref: 'young'
  },

  tagId: {
    type: mongoose.Types.ObjectId,
    ref: 'tag',
    documentation: {
      description: "étiquette reliées au ticket'",
    },
  },
  messages: {
    type: Message,
  },

  closedAt: {
    type: Date,
  },
}, { timestamps: true });

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
