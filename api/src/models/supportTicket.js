const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");

const esClient = require("../es");

const MODELNAME = "support_ticket";

const Message = new mongoose.Schema(
  {
    canal: {
      type: String,
      enum: ["Chat", "Mail", "Plateforme", "Formulaire", "Facebook", "Twitter", ""],
      documentation: {
        description: "canal de communication d'où provient le ticket",
      },
    },
    body: {
      type: String,
      documentation: {
        description: "contenu du message",
      },
    },
    internalOnly: {
      type: Boolean,
      documentation: {
        description: "le message est-il de visibilité interne seulement",
      },
    },
    // connection with existing db
    emitterUserId: {
      type: mongoose.Types.ObjectId,
      refPath: "createdByModel",
      documentation: {
        description: "https://github.com/Automattic/mongoose/issues/4217, https://mongoosejs.com/docs/populate.html#dynamic-ref",
      },
    },
    emitterModel: {
      type: String,
      enum: ["young", "referent", ""],
      documentation: {
        description: "modèle de référence en base de donnée de l'émetteur. Il y en a deux pour le SNU, il pourrait y en avoir, 1 seul ou autant qu'on veut",
      },
    },
    emitterRole: {
      type: String,
      documentation: {
        description: "rôle de l'émetteur : agent, référent, volontaire...",
      },
    },

    // zammad migration
    zammadCreatedById: {
      type: String,
      documentation: {
        description: "identifiant Zammad de l'émetteur",
      },
    },
    zammadEmitterRole: {
      type: String,
      documentation: {
        description: "rôle de l'émetteur sur Zammad",
      },
    },
    zammadId: {
      type: String,
      documentation: {
        description: "identifiant dans Zammad",
      },
    },
    zammadType: {
      type: String,
      documentation: {
        description: "zammad type",
      },
    },
    zammadContentType: {
      type: String,
      documentation: {
        description: "zammad content type",
      },
    },
  },
  { timestamps: true },
);

const Schema = new mongoose.Schema(
  {
    // infos
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
    },
    category: {
      type: String,
      enum: ["TECHNICAL", "QUESTION", ""],
      documentation: {
        description: "Catégorie du ticket",
      },
    },
    subject: {
      type: String,
      documentation: {
        description: "Sujet du ticket",
      },
    },
    canal: {
      type: String,
      enum: ["Chat", "Mail", "Plateforme", "Formulaire", "Facebook", "Twitter", ""],
      documentation: {
        description: "canal de communication d'où provient le ticket",
      },
    },
    group: {
      type: String,
      enum: ["Admin", "Contact", "Inscription", "Jeunes", "Référents", "Structures", "Sous-direction", "Volontaires", "Test", "AnciensUsers"],
      documentation: {
        description: "nom du groupe",
      },
    },
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
    messages: {
      type: [Message],
    },

    // emitter
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

    // ventilation
    addressedToAgent: {
      type: [String],
      enum: ["SUPPORT", "TECHNICAL", "DEPARTMENT_REFERENT", "REGION_REFERENT", ""],
      documentation: {
        description: "L'agent (ou les agents) auquel est destiné le ticket",
      },
    },
    agentInChargeId: {
      type: mongoose.Types.ObjectId,
      ref: "support_user",
      documentation: {
        description: "identifiant de l'agent en charge du ticket",
      },
    },

    // stats
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
    lastAgentInChargeUpdateAt: {
      type: Date,
      documentation: {
        description: "dernière mise à jour de la part de l'agent en charge",
      },
    },

    tags: {
      type: Array,
      documentation: {
        description: "étiquettes reliées au ticket",
      },
    },
    closedAt: {
      type: Date,
    },
    // connection with existing db
    emitterYoungId: {
      type: mongoose.Types.ObjectId,
      ref: "young",
      documentation: {
        description: "Identifiant de l'émetteur volontaire",
      },
    },
    emitterUserId: {
      type: mongoose.Types.ObjectId,
      ref: "referent",
      documentation: {
        description: "Identifiant de l'émetteur",
      },
    },
    // zammad migration
    zammadId: {
      type: String,
      documentation: {
        description: "identifiant dans Zammad",
      },
    },
    agentInChargeZammadId: {
      type: String,
      documentation: {
        description: "identifiant de l'agent en charge du ticket",
      },
    },
    emitterZammadId: {
      type: String,
      documentation: {
        description: "identifiant Zammad de l'émetteur",
      },
    },
    lastUpdateById: {
      type: String,
      documentation: {
        description: "zammad: updated by id...",
      },
    },
  },
  { timestamps: true },
);

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
