import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import bcrypt from "bcryptjs";

import mongooseElastic from "@selego/mongoose-elastic";
import { ReferentCreatedBy, InvitationType } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";
import esClient from "../es";
import * as brevo from "../brevo";
import anonymize from "../anonymization/referent";

import { SUB_ROLES_LIST, ROLES_LIST, VISITOR_SUB_ROLES_LIST } from "snu-lib";

const MODELNAME = "referent";

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
  isConfirmationPending: {
    type: Boolean,
    documentation: {
      description: "Indique si une invitation de confirmation est en attente",
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

const schema = new Schema({
  sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "Identifiant dans l'ancienne base de données",
    },
  },
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
});

schema.virtual("fullName").get(function () {
  const { firstName, lastName } = this;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  else return firstName || lastName;
});

schema.pre<SchemaExtended>("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
  return next();
});

schema.methods.comparePassword = async function (p: string) {
  const user = await ReferentModel.findById(this._id).select("password");
  return bcrypt.compare(p, user!.password || "");
};

schema.methods.anonymise = function () {
  return anonymize(this);
};

//Sync with Sendinblue
schema.post("save", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("findOneAndUpdate", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("remove", function (doc) {
  brevo.unsync(doc);
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: [
    "/password",
    "/lastLoginAt",
    "/lastActivityAt",
    "/lastLogoutAt",
    "/passwordChangedAt",
    "/nextLoginAttemptIn",
    "/forgotPasswordResetToken",
    "/forgotPasswordResetExpires",
    "/invitationToken",
    "/invitationExpires",
    "/loginAttempts",
    "/attempts2FA",
    "/updatedAt",
    "/token2FA",
    "/token2FAExpires",
  ],
});

schema.plugin(
  mongooseElastic(esClient, {
    selectiveIndexing: true,
    ignore: [
      "password",
      "lastLogoutAt",
      "passwordChangedAt",
      "nextLoginAttemptIn",
      "forgotPasswordResetToken",
      "forgotPasswordResetExpires",
      "invitationToken",
      "invitationExpires",
      "loginAttempts",
      "attempts2FA",
      "updatedAt",
      "lastActivityAt",
      "token2FA",
      "token2FAExpires",
    ],
  }),
  MODELNAME,
);

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

export type ReferentType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ReferentDocument<T = {}> = DocumentExtended<
  ReferentType & {
    // virtual fields
    fullName?: string;
  } & T
>;
type SchemaExtended = ReferentDocument & UserExtension;

export const ReferentModel = mongoose.model<ReferentDocument>(MODELNAME, schema);
