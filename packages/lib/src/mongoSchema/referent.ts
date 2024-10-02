import { Schema, InferSchemaType } from "mongoose";

import { SUB_ROLES_LIST, ROLES_LIST, VISITOR_SUB_ROLES_LIST } from "../roles";
import { ReferentCreatedBy, InvitationType } from "../constants/referentConstants";

import { InterfaceExtended } from "..";

const referentMetadataSchema = {
  createdBy: {
    type: String,
    enum: ReferentCreatedBy,
    documentation: {
      description: "Par quel workflow a été créé le référent",
    },
  },
  updatedBy: {
    type: String,
    documentation: {
      description: "Par quel workflow a été modifié le référent",
    },
  },
  isFirstInvitationPending: {
    type: Boolean,
    documentation: {
      description: "Indique si une invitation est en attente de première envoi",
    },
  },
  invitationType: {
    type: String,
    enum: InvitationType,
    documentation: {
      description: "Indique si le référent doit recevoir un email d'inscription ou de reinscription",
    },
  },
};

export const ReferentSchema = {
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
    lowercase: true,
    documentation: {
      description: "Email de l'utilisateur",
    },
  },
  emailValidatedAt: {
    type: Date,
    documentation: {
      description: "[CLE] Date à laquelle l'email a été validé",
    },
  },
  emailWaitingValidation: {
    type: String,
    trim: true,
    documentation: {
      description: "[CLE] Email renseigné par l'utilisateur pendant l'inscription mais pas encore validé (code envoyé)",
    },
  },

  password: {
    type: String,
    select: false,
    documentation: {
      description: "Mot de passe de l'utilisateur",
    },
  },
  loginAttempts: {
    type: Number,
    default: 0,
    documentation: {
      description: "tentative de connexion. Max 15",
    },
  },
  token2FA: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la 2FA",
    },
  },
  token2FAExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token pour 2FA",
    },
  },
  attempts2FA: {
    type: Number,
    default: 0,
    documentation: {
      description: "Tentative de connexion 2FA. Max 3",
    },
  },
  acceptCGU: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "l'utilisateur a accepté les CGU",
    },
  },
  lastLoginAt: {
    type: Date,
    documentation: {
      description: "Date de dernière connexion",
    },
  },
  lastActivityAt: {
    type: Date,
    documentation: {
      description: "Date de dernière activité",
    },
  },
  lastLogoutAt: {
    type: Date,
    select: true,
    documentation: {
      description: "Date de dernière déconnexion",
    },
  },
  passwordChangedAt: {
    type: Date,
    select: true,
    documentation: {
      description: "Date de dernier changement de password",
    },
  },
  registredAt: {
    type: Date,
    documentation: {
      description: "Date de création",
    },
  },

  nextLoginAttemptIn: {
    type: Date,
    documentation: {
      description: "Date pour autoriser la prochaine tentative de connexion",
    },
  },

  forgotPasswordResetToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la réinitialisation du mot de passe",
    },
  },
  forgotPasswordResetExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token pour réinitialiser le mot de passe",
    },
  },

  invitationToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token d'invitation",
    },
  },
  invitationExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token d'invitation",
    },
  },

  role: {
    type: String,
    enum: ROLES_LIST,
    documentation: {
      description: "Rôle de l'utilisateur sur l'app",
    },
  },

  subRole: {
    type: String,
    enum: [...SUB_ROLES_LIST, ...VISITOR_SUB_ROLES_LIST, "god"],
  },

  // Specific fields

  // Regional and departmental referent
  region: {
    type: String,
    default: "",
    documentation: {
      description: "Région de l'utilisateur, si applicable",
    },
  },
  department: {
    type: [String],
    documentation: {
      description: "Département de l'utilisateur, si applicable",
    },
  },

  // Responsible and Supervisor
  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure de l'utilisateur, si applicable",
    },
  },

  // Head center
  sessionPhase1Id: {
    type: String,
    documentation: {
      description: "Id de la session de cohésion d'accueil pour la phase 1",
    },
  },
  cohorts: {
    type: [String],
    documentation: {
      description: "Identifiant des cohortes du chef de centre",
    },
  },
  cohortIds: {
    type: [String],
    documentation: {
      description: "Liste des Ids des cohortes du chef de centre",
    },
  },

  // End specific fields

  // *** START LEGACY COHESION CENTER ***
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion d'accueil pour la phase 1",
    },
  },
  cohesionCenterName: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  // *** END LEGACY COHESION CENTER ***
  phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone fix",
    },
  },

  mobile: {
    type: String,
    documentation: {
      description: "Numéro de portable",
    },
  },

  metadata: {
    type: referentMetadataSchema,
    default: {},
    documentation: {
      description: "Métadonnées d'un référent",
    },
  },

  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(ReferentSchema);
export type ReferentType = InterfaceExtended<InferSchemaType<typeof schema>> & {
  // virtual fields
  fullName?: string;
};
