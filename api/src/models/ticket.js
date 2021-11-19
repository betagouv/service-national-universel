const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;

const esClient = require("../es");

const MODELNAME = "ticket";

const Messages = new mongoose.Schema({});

const Schema = new mongoose.Schema({
  id: {
    type: String,
    index: true,
    documentation: {
      description: "Identifiant",
    },
  },
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

  lastAgentInChargeUpdate: {
    type: String,
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
    type: Messages,
  },

  closedAt: {
    type: Date,
  },
}, { timestamps: true });

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.user = params?.fromUser;
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

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
