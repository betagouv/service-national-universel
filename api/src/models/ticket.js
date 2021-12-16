const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");

const esClient = require("../es");

const MODELNAME = "ticket";

const Message = new mongoose.Schema(
  {
    zammadId: {
      type: String,
      documentation: {
        description: "identifiant dans Zammad",
      },
    },
    type: {
      type: String,
      documentation: {
        description: "zammad type",
      },
    },
    emitterSNURole: {
      type: String,
      documentation: {
        description: "rôle de l'émetteur : agent, référent, volontaire...",
      },
    },
    emitterZammadRole: {
      type: String,
      documentation: {
        description: "rôle de l'émetteur sur Zammad",
      },
    },
    createdByUserId: {
      type: mongoose.Types.ObjectId,
      ref: "referent",
    },
    createdByYoungId: {
      type: mongoose.Types.ObjectId,
      ref: "young",
    },
    createdByZammadId: {
      type: String,
      documentation: {
        description: "identifiant Zammad de l'émetteur",
      },
    },
    contentType: {
      type: String,
    },
    body: {
      type: String,
      documentation: {
        description: "contenu du message",
      },
    },
    internal: {
      type: Boolean,
      documentation: {
        description: "le message est-il de visibilité interne",
      },
    },
  },
  { timestamps: true },
);

const Schema = new mongoose.Schema(
  {
    zammadId: {
      type: String,
      documentation: {
        description: "identifiant dans Zammad",
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
      enum: ["TECHNICAL", "QUESTION", ""],
      documentation: {
        description: "Catégorie du ticket",
      },
    }, // OK
    subject: {
      type: String,
      documentation: {
        description: "Sujet du ticket",
      },
    }, // OK
    emitterYoungId: {
      type: mongoose.Types.ObjectId,
      ref: "young",
      documentation: {
        description: "Identifiant de l'émetteur volontaire",
      },
    }, // OK
    emitterUserId: {
      type: mongoose.Types.ObjectId,
      ref: "referent",
      documentation: {
        description: "Identifiant de l'émetteur",
      },
    },
    emitterZammadId: {
      type: String,
      documentation: {
        description: "identifiant Zammad de l'émetteur",
      },
    },
    emitterExternal: {
      type: Boolean,
      default: false,
    },
    emitterDepartment: {
      type: String,
      documentation: {
        description: "département de l'émetteur",
      },
    },
    emitterRegion: {
      type: String,
      documentation: {
        description: "région de l'émetteur",
      },
    },
    emitterAcademy: {
      type: String,
      documentation: {
        description: "Académie de l'émetteur",
      },
    },
    addressedToAgent: {
      type: [String],
      enum: ["AGENT_SUPPORT", "AGENT_TECHNICAL", "AGENT_DEPARTMENT_REFERENT", "AGENT_REGION_REFERENT", ""],
      documentation: {
        description: "L'agent (ou les agents) auquel est destiné le ticket",
      },
    }, // OK
    fromCanal: {
      type: String,
      enum: ["CANAL_Chat", "CANAL_Mail", "CANAL_Plateforme", "CANAL_Formulaire", "CANAL_Facebook", "CANAL_Twitter", ""],
      documentation: {
        description: "canal de communication d'où provient le ticket",
      },
    }, // OK
    group: {
      type: String,
      enum: ["Admin", "Contact", "Inscription", "Jeunes", "Référents", "Structures", "Sous-direction", "Volontaires", "Test", "AnciensUsers"],
      documentation: {
        description: "nom du groupe",
      },
    }, // OK

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH"],
      documentation: {
        description: "nom du degré de priorité",
      },
    },
    status: {
      type: String,
      enum: ["new", "open", "closed", "pending reminder", "pending close", "merged"],
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
    timeUntilFirstResponse: {
      type: String,
      documentation: {
        description: "temps écoulé avant la première réponse",
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

    agentResponseCount: {
      type: Number,
      documentation: {
        description: "nombre de réponses données par l'agent",
      },
    },

    agentInChargeId: {
      type: mongoose.Types.ObjectId,
      ref: "referent",
      documentation: {
        description: "identifiant de l'agent en charge du ticket",
      },
    },

    agentInChargeZammadId: {
      type: String,
      documentation: {
        description: "identifiant de l'agent en charge du ticket",
      },
    },

    lastAgentInChargeUpdateAt: {
      type: Date,
      documentation: {
        description: "dernière mise à jour de la part de l'agent en charge",
      },
    },

    lastUpdateById: {
      type: String,
    },

    tags: {
      type: Array,
      documentation: {
        description: "étiquettes reliées au ticket",
      },
    },
    messages: {
      type: [Message],
    },

    closedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
