const mongoose = require("mongoose");

const MODELNAME = "ticket";

const Schema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    documentation: {
      description: "Numéro du ticket",
    },
  },
  clientId: {
    type: String,
    documentation: {
      description: "ID Zammad du ticket",
    },
  },
  source: {
    type: String,
    enum: ["CHAT", "MAIL", "PLATFORM", "FORM"],
    documentation: {
      description: "canal de communication d'où provient le ticket",
    },
  },
  canal: {
    type: String,
    enum: ["MAIL", "PLATFORM"],
    documentation: {
      description: "canal de communication d'envoi du ticket",
    },
  },
  messageCount: {
    type: Number,
    documentation: {
      description: "Nombre de message dans ce ticket",
    },
    default: 1,
  },
  messageDraft: {
    type: String,
    documentation: {
      description: "Message de brouillon enregistré",
    },
  },
  status: {
    enum: ["NEW", "OPEN", "CLOSED", "PENDING", "DRAFT"],
    type: String,
  },
  subject: {
    type: String,
    documentation: {
      description: "Sujet du ticket",
    },
  },
  author: {
    type: String,
    documentation: {
      description: "Volontaire ou Représentant légal",
    },
  },
  parcours: {
    type: String,
    documentation: {
      description: "CLE ou HTS",
    },
  },
  formSubjectStep1: {
    type: String,
    documentation: {
      description: "Sujet général du formulaire du ticket",
    },
  },
  formSubjectStep2: {
    type: String,
    documentation: {
      description: "sous-sujet du formulaire du ticket",
    },
  },
  folder: {
    type: String,
    documentation: {
      description: "Dossier reliées au ticket",
    },
  },
  folderId: {
    type: String,
    documentation: {
      description: "Id du dossier reliée au ticket",
    },
  },
  folders: {
    type: [String],
    documentation: {
      description: "Dossiers reliées au ticket",
    },
  },
  foldersId: {
    type: [String],
    documentation: {
      description: "Id des dossiers reliées au ticket",
    },
  },
  tags: {
    type: [String],
    documentation: {
      description: "étiquettes reliées au ticket",
    },
  },
  tagsId: {
    type: [String],
    documentation: {
      description: "Id des étiquettes reliées au ticket",
    },
  },
  imapEmail: {
    type: String,
    documentation: {
      description: "Email imap de provenance du ticket",
    },
  },
  contactId: {
    type: String,
    documentation: {
      description: "Identifiant du contact qui a créé le ticket",
    },
  },
  contactLastName: {
    type: String,
    documentation: {
      description: "Nom du contact qui a créé le ticket",
    },
  },
  contactFirstName: {
    type: String,
    documentation: {
      description: "Prénom du contact qui a créé le ticket",
    },
  },
  contactEmail: {
    type: String,
    documentation: {
      description: "Email du contact qui a créé le ticket",
    },
  },
  contactAttributes: {
    type: [{ name: String, value: String, format: String }],
  },
  feedback: {
    type: String,
    enum: ["NEUTRAL", "WOW", "THANKS", "UNHAPPY"],
    default: "NEUTRAL",
  },
  // get agents viewing the ticket
  viewingAgent: {
    type: [{ firstName: String, lastName: String, role: String, email: String }],
    documentation: {
      description: "Email des agents qui consultent le ticket actuellement ",
    },
  },
  /////
  agentId: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  agentFirstName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  agentLastName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  agentEmail: {
    type: String,
    documentation: {
      description: "Email de l'agent responsable du ticket",
    },
  },
  referentDepartmentId: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentDepartmentFirstName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentDepartmentLastName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentDepartmentEmail: {
    type: String,
    documentation: {
      description: "Email de l'agent responsable du ticket",
    },
  },
  referentRegionId: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentRegionFirstName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentRegionLastName: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent responsable du ticket",
    },
  },
  referentRegionEmail: {
    type: String,
    documentation: {
      description: "Email de l'agent responsable du ticket",
    },
  },
  recipients: {
    type: [{ email: String, firstName: String, lastName: String }],
    documentation: {
      description: "Destinataires du ticket",
    },
  },
  copyRecipient: {
    type: [String],
    documentation: {
      description: "Contact en copie du ticket",
    },
  },
  notes: [{ content: { type: String }, createdAt: { type: Date, default: Date.now }, authorName: { type: String } }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  firstResponseAgentAt: { type: Date },
  firstResponseReferentAt: { type: Date },
  closedAt: { type: Date },
  lastUpdateAgent: {
    type: String,
    documentation: {
      description: "Identifiant de l'agent ayant mis à jour le ticket en dernier",
    },
  },
  logVentilation: {
    type: [],
  },

  ////SLAVE DATA FOR STATS AND ES \\\\

  createdBy: {
    type: String,
    documentation: {
      description: "role de l'agent support ayant créé le ticket",
    },
  },

  textMessage: {
    type: [String],
    documentation: {
      description: "Liste des messages du ticket",
    },
  },
  contactGroup: {
    type: String,
    documentation: {
      description: "Groupe du contact du ticket",
    },
    default: "unknown",
  },
  contactDepartment: {
    type: String,
    documentation: {
      description: "Département du contact du ticket",
    },
  },
  contactRegion: {
    type: String,
    documentation: {
      description: "Région du contact du ticket",
    },
  },
  contactCohort: {
    type: String,
    documentation: {
      description: "Cohorte du contact du ticket",
    },
  },
  createdHourAt: {
    type: String,
    documentation: {
      description: "Heure de création du ticket",
    },
  },
  createdDayAt: {
    type: String,
    documentation: {
      description: "Jour de création du ticket",
    },
  },
  firstResponseAgentTime: {
    type: String,
    documentation: {
      description: "Temps avant première réponse de l'agent au ticket en heure",
    },
  },
  firstResponseReferentTime: {
    type: String,
    documentation: {
      description: "Temps avant première réponse d'un référent au ticket en heure",
    },
  },
  closedTime: {
    type: String,
    documentation: {
      description: "Temps de traitement avant fermeture du ticket en heure",
    },
  },
  closedTimeHours: {
    type: Number,
    documentation: {
      description: "Temps de traitement avant fermeture du ticket en heure",
    },
  },
  macroApplied: {
    type: Boolean,
    documentation: {
      description: "Macro appliqué ou non",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
