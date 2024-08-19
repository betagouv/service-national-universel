import mongoose, { Schema, Types, InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";
import mongooseElastic from "@selego/mongoose-elastic";
import patchHistory from "mongoose-patch-history";
import { ROLES_LIST, PHONE_ZONES_NAMES_ARR, YOUNG_SOURCE_LIST, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";
import esClient from "../es";
import * as brevo from "../brevo";
import config from "config";
import anonymize from "../anonymization/young";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "young";

const ClasseStateManager = require("../cle/classe/stateManager").default;

const File = new Schema({
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
  category: String,
  expirationDate: Date,
  side: String,
});

const CorrectionRequest = new Schema({
  moderatorId: {
    type: Types.ObjectId,
    required: true,
    documentation: {
      description: "Identifiant du demandeur",
    },
  },
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte du jeune au moment de la dernière action sur cette demande de correction",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  field: {
    type: String,
    required: true,
    documentation: {
      description: "Champs concerné pour la demande de correction. (une seule demande par champs",
    },
  },
  reason: {
    type: String,
    documentation: {
      description: "Motif de la demande de correction",
    },
  },
  message: {
    type: String,
    documentation: {
      description: "Message complétementaire pour la demande de correction",
    },
  },
  status: {
    type: String,
    required: true,
    default: "PENDING",
    enum: ["PENDING", "SENT", "REMINDED", "CORRECTED", "CANCELED"],
    documentation: {
      description: "Etat de la demande de correction",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de création de la demande de correction",
    },
  },

  sentAt: {
    type: Date,
    documentation: {
      description: "Date de premier envoi de la demande de correction",
    },
  },
  remindedAt: {
    type: Date,
    documentation: {
      description: "Date de la dernière relance envoyée au jeune",
    },
  },
  correctedAt: {
    type: Date,
    documentation: {
      description: "Date de correction du jeune",
    },
  },
  canceledAt: {
    type: Date,
    documentation: {
      description: "Date d'annulation de la demande",
    },
  },
});

const Note = new mongoose.Schema({
  phase: {
    type: String,
    enum: ["INSCRIPTION", "PHASE_1", "PHASE_2", "PHASE_3", ""],
  },
  note: { type: String, required: true },
  referent: new mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ROLES_LIST,
      required: true,
    },
  }),
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

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
      description: "Prénom du volontaire",
    },
  },
  lastName: {
    type: String,
    documentation: {
      description: "Nom du volontaire",
    },
  },
  frenchNationality: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est de nationalité française",
    },
  },
  birthCountry: {
    type: String,
    documentation: {
      description: "Pays de naissance",
    },
  },
  birthCity: {
    type: String,
    documentation: {
      description: "La ville de naissance du volontaire",
    },
  },
  birthCityZip: {
    type: String,
    documentation: {
      description: "Le code postal de la ville de naissance du volontaire",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    documentation: {
      description: "E-mail du volontaire",
    },
  },
  emailVerified: {
    type: String,
    documentation: {
      description: "L'utilisateur a validé son email : 2FA possible",
    },
  },
  newEmail: {
    type: String,
    trim: true,
    documentation: {
      description: "E-mail que le volontaire souhaite utiliser (valiation par code envoyé par email avant changement définitif de l'email)",
    },
  },
  phone: {
    type: String,
    documentation: {
      description: "Numéro de télephone du volontaire",
    },
  },
  phoneZone: {
    type: String,
    enum: PHONE_ZONES_NAMES_ARR,
    documentation: {
      description: "Zone géographique de provenance du numéro du volontaire",
    },
  },
  gender: {
    type: String,
    documentation: {
      description: "Sexe",
    },
  },
  birthdateAt: {
    type: Date,
    documentation: {
      description: "Date de naissance du volontaire",
    },
  },
  cohort: {
    type: String,
    documentation: {
      description: "Cohorte",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  originalCohort: {
    type: String,
    documentation: {
      description: "Cohorte d'origine du volontaire, dans le cas ou il a changé de cohorte après sa validation",
    },
  },
  originalCohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte d'origine",
    },
  },
  cohortChangeReason: {
    type: String,
    documentation: {
      description: "Raison de changement de cohorte.",
    },
  },
  cohortDetailedChangeReason: {
    type: String,
    documentation: {
      description: "Raison détaillé et facultative de changement de cohorte.",
    },
  },
  phase: {
    type: String,
    default: "INSCRIPTION",
    enum: ["INSCRIPTION", "COHESION_STAY", "INTEREST_MISSION", "CONTINUE"],
    documentation: {
      description: "Phase actuelle du volontaire",
    },
  },
  status: {
    type: String,
    default: "IN_PROGRESS",
    enum: [
      "IN_PROGRESS",
      "WAITING_VALIDATION",
      "WAITING_CORRECTION",
      "REINSCRIPTION",
      "VALIDATED",
      "REFUSED",
      "WITHDRAWN",
      "DELETED",
      "WAITING_LIST",
      "NOT_ELIGIBLE",
      "ABANDONED",
      "NOT_AUTORISED",
    ],
    documentation: {
      description: "Statut général du volontaire",
    },
  },

  statusPhase1: {
    type: String,
    default: "WAITING_AFFECTATION",
    //WITHDRAWN is legacy
    enum: ["AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"],
    documentation: {
      description: "Statut du volontaire lié à la première phase",
    },
  },
  statusPhase1Tmp: {
    type: String,
    enum: ["AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"],
    documentation: {
      description: "Statut du volontaire lié à la première phase",
    },
  },
  statusPhase1Motif: {
    type: String,
    enum: ["ILLNESS", "DEATH", "ADMINISTRATION_CANCEL", "OTHER"],
    documentation: {
      description: "Motif du statut du volontaire lié à la première phase",
    },
  },
  statusPhase1MotifDetail: {
    type: String,
    documentation: {
      description: "Détail du motif du statut du volontaire lié à la première phase",
    },
  },
  statusPhase2: {
    type: String,
    default: "WAITING_REALISATION",
    //WITHDRAWN is legacy
    enum: ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED", "WITHDRAWN"],
    documentation: {
      description: "Statut du volontaire lié à la seconde phase",
    },
  },
  statusPhase2UpdatedAt: {
    type: Date,
    documentation: {
      description: "Date de dernière modification du statut lié à la seconde phase",
    },
  },
  statusPhase2OpenedAt: {
    type: Date,
    documentation: {
      description: "Date d'ouverture de la seconde phase",
    },
  },
  statusPhase2ValidatedAt: {
    type: Date,
    documentation: {
      description: "Date à laquelle la seconde phase est validée",
    },
  },
  statusPhase2Contract: {
    type: [String],
    default: [],
    enum: ["NONE", "DRAFT", "SENT", "VALIDATED"],
    documentation: {
      description: "Statut du contrat d'engagement du volontaire (cf: modèle contrat)",
    },
  },
  statusPhase3: {
    type: String,
    default: "WAITING_REALISATION",
    //WITHDRAWN is legacy
    enum: ["WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED", "WITHDRAWN"],
    documentation: {
      description: "Statut du volontaire lié à la troisième phase",
    },
  },
  statusPhase3UpdatedAt: {
    type: Date,
    documentation: {
      description: "Date de dernière modification du statut lié à la troisième phase",
    },
  },
  statusPhase3ValidatedAt: {
    type: Date,
    documentation: {
      description: "Date à laquelle la troisième phase est validée",
    },
  },
  lastStatusAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière modification d'un statut",
    },
  },
  withdrawnReason: {
    type: String,
    documentation: {
      description: "Motif lors de l'abandon du SNU.",
    },
  },
  withdrawnMessage: {
    type: String,
    documentation: {
      description: "Message écrit lors de l'abandon du SNU.",
    },
  },

  hasStartedReinscription: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Le jeune a commencé sa réinscription",
    },
  },

  // also used for 2024
  reinscriptionStep2023: {
    type: String,
    enum: ["ELIGIBILITE", "NONELIGIBLE", "SEJOUR", "COORDONNEES", "CONSENTEMENTS", "DOCUMENTS", "REPRESENTANTS", "WAITING_CONSENT", "CONFIRM", "DONE"],
    documentation: {
      description: "Étape du tunnel de réinscription 2023",
    },
  },

  // also used for 2024
  inscriptionStep2023: {
    type: String,
    enum: ["EMAIL_WAITING_VALIDATION", "COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS", "DOCUMENTS", "DONE", "CONFIRM", "WAITING_CONSENT"],
    documentation: {
      description: "Étape du tunnel d'inscription 2023/2024",
    },
  },

  // @deprecated
  inscriptionStep: {
    type: String,
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "AVAILABILITY", "DONE", "DOCUMENTS"],
    documentation: {
      description: "Étape du tunnel d'inscription",
    },
  },

  inscriptionDoneDate: {
    type: Date,
    documentation: {
      description: "Date de validation de l'inscription par le jeune",
    },
  },

  // keep track of the current cohesion inscription step for 2020 users
  cohesion2020Step: {
    type: String,
    default: "CONSENTEMENTS",
    enum: ["CONSENTEMENTS", "COORDONNEES", "PARTICULIERES", "JDC", "DONE"],
    documentation: {
      description: "Étape du tunnel d'inscription sur le formulaire allégé (uniquement disponible pour la cohorte 2020)",
    },
  },
  // Inscription status message
  inscriptionCorrectionMessage: {
    type: String,
    documentation: {
      description: "Message envoyé au volontaire dans le cas où son inscription nécessite des corrections.",
    },
  },
  inscriptionRefusedMessage: {
    type: String,
    documentation: {
      description: "Message envoyé au volontaire dans le cas où son inscription est refusée.",
    },
  },

  // userName and userId because it can be a young or a referent
  historic: {
    type: [
      {
        phase: String,
        createdAt: { type: Date, default: Date.now },
        userName: String,
        userId: String,
        status: String,
        note: { type: String, default: "" },
      },
    ],
    default: [],
    documentation: {
      description: "Historique retraçant les différents statut par lequel le volontaire est passé",
    },
  },

  password: {
    type: String,
    select: false,
    documentation: {
      description: "Mot de passe du volontaire",
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
  tokenEmailValidation: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la validation d'email",
    },
  },
  tokenEmailValidationExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token pour validation d'email",
    },
  },
  attemptsEmailValidation: {
    type: Number,
    default: 0,
    documentation: {
      description: "Tentative de validation d'email. Max 3",
    },
  },
  loginAttempts: {
    type: Number,
    default: 0,
    documentation: {
      description: "tentative de connexion. Max 15",
    },
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
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
  acceptCGU: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "Le volontaire a accepté les CGU",
    },
  },
  acceptRI: {
    type: String,
    documentation: {
      description: "Version du reglement intérieur acceptée.",
    },
  },
  cniFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichiers - Pièces d'identité",
    },
  },

  // * phase1 infos
  cohesionStayPresence: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire était présent lors du séjour de cohésion",
    },
  },
  presenceJDM: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire était présent lors de la JDM",
    },
  },
  cohesionStayMedicalFileReceived: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "La fiche sanitaire a été reçu par le SNU",
    },
  },
  departInform: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a déjà informé son départ",
    },
  },
  departSejourAt: {
    type: Date,
    documentation: {
      description: "Date à laquelle volontaire a quitté le centre de cohésion",
    },
  },
  departSejourMotif: {
    type: String,
    documentation: {
      description: "Motif de départ du centre de cohésion",
    },
  },
  departSejourMotifComment: {
    type: String,
    documentation: {
      description: "Commentaires sur le départ du centre de cohésion (facultatif)",
    },
  },
  cohesionStayMedicalFileDownload: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La fiche sanitaire a été reçu par le SNU",
    },
  },

  convocationFileDownload: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La convacation a été telechargée",
    },
  },

  //Phase 0 classe engagée
  classeId: {
    type: String,
    documentation: {
      description: "Id de la classe engagée",
    },
  },

  etablissementId: {
    type: String,
    documentation: {
      description: "Id de l'établissement CLE",
    },
  },

  source: {
    type: String,
    enum: YOUNG_SOURCE_LIST,
    default: YOUNG_SOURCE.VOLONTAIRE,
    documentation: {
      description: "Type de parcours d'un jeune",
    },
  },

  //Phase 1 Affectation
  sessionPhase1Id: {
    type: String,
    documentation: {
      description: "Id de la session de cohésion d'accueil pour la phase 1",
    },
  },
  sessionPhase1IdTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion d'accueil pour la phase 1",
    },
  },

  ligneId: {
    type: String,
    documentation: {
      description: "Id de la ligne de bus pour la phase 1",
    },
  },

  meetingPointId: {
    type: String,
    documentation: {
      description: "Identifiant du point de rassemblement pour le sejour de cohesion",
    },
  },
  deplacementPhase1Autonomous: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire se rend au centre de cohésion par ses propres moyens ",
    },
  },

  transportInfoGivenByLocal: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Les informations de transport sont transmises par les services locaux",
    },
  },

  hasMeetingInformation: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire a été informé du lieu de rencontre",
    },
  },
  isTravelingByPlane: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire voyage en avion",
    },
  },

  // Legacy ?
  codeCenterTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },
  busTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },

  // *** START LEGACY COHESION CENTER ***
  // phase1 legacy infos, we keep it for retrocompatibility, can be deleted in the future
  cohesionCenterName: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  cohesionCenterZip: {
    type: String,
    documentation: {
      description: "Code postal du centre de cohésion d'accueil pour la phase 1",
    },
  },
  cohesionCenterCity: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  // *** END LEGACY COHESION CENTER ***

  autoAffectationPhase1ExpiresAt: {
    type: Date,
    documentation: {
      description: "Date limite de réponse a la participation à la phase 1",
    },
  },

  // * phase 2 application infos
  phase2ApplicationStatus: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des statuts des candidatures de phase 2 pour le jeune",
    },
  },

  phase2ApplicationFilesType: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des type de fichier des candidatures de phase 2 pour le jeune",
    },
  },

  phase2NumberHoursDone: {
    type: String,
    documentation: {
      description: "Somme des heures de mission effectuées",
    },
  },
  phase2NumberHoursEstimated: {
    type: String,
    documentation: {
      description: "Sommes des heures de mission prévisionnelles",
    },
  },

  // * phase 3 infos
  phase3StructureName: { type: String },
  phase3MissionDomain: { type: String },
  phase3MissionDescription: { type: String },
  phase3MissionStartAt: { type: Date },
  phase3MissionEndAt: { type: Date },

  phase3TutorFirstName: { type: String },
  phase3TutorLastName: { type: String },
  phase3TutorEmail: { type: String },
  phase3TutorPhone: { type: String },
  phase3TutorNote: { type: String },

  phase3Token: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la validation de la phase 3",
    },
  },

  // * address
  address: {
    type: String,
    documentation: {
      description: "Adresse pendant le snu du volontaire",
    },
  },
  coordinatesAccuracyLevel: {
    type: String,
    enum: ["housenumber", "street", "locality", "municipality"],
    documentation: {
      description: "Type d'adresse du volontaire dans la Base adresse nationale",
    },
  },
  complementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse pendant le snu du volontaire",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal pendant le snu du volontaire",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville pendant le snu du volontaire",
    },
  },
  addressVerified: {
    type: String,
    documentation: {
      description: "Adresse validée",
    },
  },
  cityCode: {
    type: String,
    documentation: {
      description: "Code pendant le snu insee de la ville",
    },
  },
  populationDensity: {
    type: String,
    enum: ["TRES PEU DENSE", "PEU DENSE", "INTERMEDIAIRE", "DENSE", ""],
    documentation: {
      description: "Densité de la ville  pendant le snu du volontaire",
    },
  },
  isRegionRural: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Ruralité de la ville pendant le snu du volontaire",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département pendant le snu du volontaire",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région pendant le snu du volontaire",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays de résidence pendant le snu du volontaire",
    },
  },
  location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  qpv: {
    type: String,
    // TODO: REMOVE "" value from enum after cleaning DB from string empty values.
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire est dans un Quarier Prioritaire pendant le snu",
    },
  },
  foreignAddress: {
    type: String,
    documentation: {
      description: "Adresse à l'étranger du volontaire",
    },
  },
  foreignCity: {
    type: String,
    documentation: {
      description: "Ville à l'étranger du volontaire",
    },
  },
  foreignZip: {
    type: String,
    documentation: {
      description: "Code postal à l'étranger du volontaire",
    },
  },
  foreignCountry: {
    type: String,
    documentation: {
      description: "Pays à l'étranger du volontaire",
    },
  },

  // * School informations
  situation: {
    type: String,
    documentation: {
      description: "Situation scolaire / professionnel du volontaire",
    },
  },
  grade: {
    type: String,
    documentation: {
      description: "Niveau scolaire du volontaire, si applicable",
    },
  },
  schoolCertification: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "",
    },
  },
  schooled: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est scolarisé",
    },
  },
  schoolName: {
    type: String,
    documentation: {
      description: "Nom de l'établissement du volontaire",
    },
  },
  schoolNameOld: {
    type: String,
    documentation: {
      description: "Nom de l'établissement du volontaire si schoolName amonymisé",
    },
  },
  schoolType: {
    type: String,
    documentation: {
      description: "Type de l'établissement du volontaire",
    },
  },
  schoolAddress: {
    type: String,
    documentation: {
      description: "Adresse de l'établissement du volontaire",
    },
  },
  schoolComplementAdresse: {
    type: String,
    documentation: {
      description: "Complément d'adresse de l'établissement du volontaire",
    },
  },
  schoolZip: {
    type: String,
    documentation: {
      description: "Code postal de l'établissement du volontaire",
    },
  },
  schoolCity: {
    type: String,
    documentation: {
      description: "Ville de l'établissement du volontaire",
    },
  },
  schoolDepartment: {
    type: String,
    documentation: {
      description: "Département de l'établissement du volontaire",
    },
  },
  schoolRegion: {
    type: String,
    documentation: {
      description: "Région de l'établissement du volontaire",
    },
  },
  schoolCountry: {
    type: String,
    documentation: {
      description: "Pays de l'établissement du volontaire",
    },
  },
  schoolLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },
  schoolId: {
    type: String,
    documentation: {
      description: "Identifiant de l'établissement du volontaire",
    },
  },
  academy: {
    type: String,
    documentation: {
      description: "Académie du volontaire (en fonction de son domicile)",
    },
  },

  // * Situations pro
  employed: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est employé",
    },
  },

  // * Parents et représentants
  parent1Status: {
    type: String,
    documentation: {
      description: "Statut légal du parent 1",
    },
  },
  parent1FirstName: {
    type: String,
    documentation: {
      description: "Prénom du parent 1",
    },
  },
  parent1LastName: {
    type: String,
    documentation: {
      description: "Nom du parent 1",
    },
  },
  parent1Email: {
    type: String,
    lowercase: true,
    trim: true,
    documentation: {
      description: "E-mail du parent 1",
    },
  },
  parent1Phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone du parent 1",
    },
  },
  parent1PhoneZone: {
    type: String,
    enum: PHONE_ZONES_NAMES_ARR,
    documentation: {
      description: "Zone géographique de provenance du numéro du parent 1",
    },
  },
  parent1OwnAddress: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 a sa propre adresse. Elle est différent de celle du volontaire",
    },
  },
  parent1Address: {
    type: String,
    documentation: {
      description: "Adresse du parent 1",
    },
  },
  parent1coordinatesAccuracyLevel: {
    type: String,
    enum: ["housenumber", "street", "locality", "municipality"],
  },
  parent1ComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse du parent 1",
    },
  },
  parent1Zip: {
    type: String,
    documentation: {
      description: "Code postal du parent 1",
    },
  },
  parent1City: {
    type: String,
    documentation: {
      description: "Ville du parent 1",
    },
  },
  parent1CityCode: {
    type: String,
    documentation: {
      description: "Code insee de la Ville du parent 1",
    },
  },
  parent1Department: {
    type: String,
    documentation: {
      description: "Département du parent 1",
    },
  },
  parent1Region: {
    type: String,
    documentation: {
      description: "Région du parent 1",
    },
  },
  parent1Country: {
    type: String,
    documentation: {
      description: "Pays du parent 1",
    },
  },
  parent1Location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  parent1FromFranceConnect: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Le parent 1 s'est identifié via France Connect",
    },
  },
  parent1Inscription2023Token: {
    type: String,
    documentation: {
      description: "Token d'inscription 2023 du parent 1",
    },
  },
  parent1DataVerified: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 a certifié l'exactitude des renseignements",
    },
  },
  parent1AddressVerified: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 a certifié l'exactitude des renseignements",
    },
  },
  parent1AllowCovidAutotest: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 autorise les autotests Covid",
    },
  },
  parent1AllowImageRights: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 donne les droits à l'image de son enfant.",
    },
  },

  parent1ContactPreference: {
    type: String,
    enum: ["email", "phone"],
    documentation: {
      description: "Préférence de contact du parent 1",
    },
  },

  parent2Status: {
    type: String,
    documentation: {
      description: "Statut légal du parent 2",
    },
  },
  parent2FirstName: {
    type: String,
    documentation: {
      description: "Prénom du parent 2",
    },
  },
  parent2LastName: {
    type: String,
    documentation: {
      description: "Nom du parent 2",
    },
  },
  parent2Email: {
    type: String,
    lowercase: true,
    trim: true,
    documentation: {
      description: "E-mail du parent 2",
    },
  },
  parent2Phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone du parent 2",
    },
  },
  parent2PhoneZone: {
    type: String,
    enum: PHONE_ZONES_NAMES_ARR,
    documentation: {
      description: "Zone géographique de provenance du numéro du parent 1",
    },
  },
  parent2OwnAddress: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 2 a sa propre adresse. Elle est différent de celle du volontaire",
    },
  },
  parent2Address: {
    type: String,
    documentation: {
      description: "Adresse du parent 2",
    },
  },
  parent2coordinatesAccuracyLevel: {
    type: String,
    enum: ["housenumber", "street", "locality", "municipality"],
  },
  parent2ComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse du parent 2",
    },
  },
  parent2Zip: {
    type: String,
    documentation: {
      description: "Code postal du parent 2",
    },
  },
  parent2City: {
    type: String,
    documentation: {
      description: "Ville du parent 2",
    },
  },
  parent2CityCode: {
    type: String,
    documentation: {
      description: "Code insee de la ville du parent 2",
    },
  },
  parent2Department: {
    type: String,
    documentation: {
      description: "Département du parent 2",
    },
  },
  parent2Region: {
    type: String,
    documentation: {
      description: "Région du parent 2",
    },
  },
  parent2Country: {
    type: String,
    documentation: {
      description: "Pays du parent 2",
    },
  },
  parent2Location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  parent2FromFranceConnect: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Le parent 2 s'est identifié via France Connect",
    },
  },
  parent2Inscription2023Token: {
    type: String,
    documentation: {
      description: "Token d'inscription 2023 du parent 1",
    },
  },
  parent2AllowImageRights: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 2 donne les droits à l'image de son enfant.",
    },
  },
  parent2AllowImageRightsReset: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "L'admin a réinitialiser l'information de droits à l'image du parent 2.",
    },
  },

  parent2ContactPreference: {
    type: String,
    enum: ["email", "phone"],
    documentation: {
      description: "Préférence de contact du parent 2",
    },
  },

  // * Hébergeur
  hostLastName: {
    type: String,
    documentation: {
      description: "Nom de l'hébergeur",
    },
  },
  hostFirstName: {
    type: String,
    documentation: {
      description: "Prénom de l'hébergeur",
    },
  },
  hostRelationship: {
    type: String,
    documentation: {
      description: "Lien de l'hébergeur avec le volontaire",
    },
  },

  // TODO: cleanup host address fields (they are not used anymore).
  hostCity: {
    type: String,
    documentation: {
      description: "Ville de l'hébergeur",
    },
  },
  hostZip: {
    type: String,
    documentation: {
      description: "Code postale de la ville de l'hébergeur",
    },
  },
  hostAddress: {
    type: String,
    documentation: {
      description: "Adresse de l'hébergeur",
    },
  },
  hostDepartment: {
    type: String,
    documentation: {
      description: "Departement de l'hébergeur",
    },
  },
  hostRegion: {
    type: String,
    documentation: {
      description: "Région de l'hébergeur",
    },
  },
  // * Situations particulières
  handicap: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a un handicap",
    },
  },
  allergies: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a des allergies",
    },
  },
  handicapInSameDepartment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire souhaite être affecté dans son département",
    },
  },
  reducedMobilityAccess: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a besoin d’un aménagement pour mobilité réduite",
    },
  },
  ppsBeneficiary: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "le volontaire bénéficie d'un PPS (projet personnalisé de scolarisation)",
    },
  },
  paiBeneficiary: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire bénéficie d'un PAI (projet d'accueil individualisé)",
    },
  },

  medicosocialStructure: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est suivi par une structure médicosociale",
    },
  },
  medicosocialStructureName: {
    type: String,
    documentation: {
      description: "Nom de la structure médicosociale",
    },
  },
  medicosocialStructureAddress: {
    type: String,
    documentation: {
      description: "Adresse de la structure médicosociale",
    },
  },
  medicosocialStructureComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse de la structure médicosociale",
    },
  },
  medicosocialStructureZip: {
    type: String,
    documentation: {
      description: "Code postal de la structure médicosociale",
    },
  },
  medicosocialStructureCity: {
    type: String,
    documentation: {
      description: "Ville de la structure médicosociale",
    },
  },
  medicosocialStructureDepartment: {
    type: String,
    documentation: {
      description: "Département de la structure médicosociale",
    },
  },
  medicosocialStructureRegion: {
    type: String,
    documentation: {
      description: "Région de la structure médicosociale",
    },
  },
  medicosocialStructureLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },

  engagedStructure: {
    type: String,
    documentation: {
      description: "Structure dans laquelle le volontaire est engagée en dehors du SNU",
    },
  },

  sameSchoolCLE: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "savoir si le volontaire vient de la même école que sa classe engagée",
    },
  },

  specificAmenagment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a besoin d'aménagements spécifiques",
    },
  },
  specificAmenagmentType: {
    type: String,
    documentation: {
      description: "Type d'aménagements spécifiques",
    },
  },

  highSkilledActivity: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire pratique une activité de haut niveau",
    },
  },
  highSkilledActivityInSameDepartment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire pratique une activité de haut niveau et souhaite etre affecté dans son département pour la phase 1",
    },
  },
  highSkilledActivityType: {
    type: String,
    documentation: {
      description: "Type de l'activité de haut niveau",
    },
  },
  highSkilledActivityProofFiles: {
    type: [String],
    documentation: {
      description: "Fichier prouvant l'activité de haut niveau",
    },
  },

  // * Consentements
  parentAllowSNU: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Les representants autorise le jeune à participer au SNU",
    },
  },
  parent1AllowSNU: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant 1 autorise le jeune à participer au SNU",
    },
  },
  parent2AllowSNU: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant 2 autorise le jeune à participer au SNU",
    },
  },
  parent1ValidationDate: {
    type: Date,
    documentation: {
      description: "La date à laquelle le representant 1 autorise ou pas le jeune à participer au SNU",
    },
  },
  parent2ValidationDate: {
    type: Date,
    documentation: {
      description: "La date à laquelle le representant 2 autorise ou pas le droit à l'image",
    },
  },
  parent2RejectSNUComment: {
    type: String,
    documentation: {
      description: "Indique la personne, le jour et la date de notification du rejet",
    },
  },
  dataProcessingConsentmentFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement au traitement des données personnelles",
    },
  },
  parentConsentment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Les représentants ont fourni leur consentement",
    },
  },
  parentConsentmentFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement des représentants",
    },
  },
  parentConsentmentFilesCompliant: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Consentement invalide",
    },
  },
  parentConsentmentFilesCompliantInfo: {
    type: String,
    documentation: {
      description: "Information supplémentaire sur l'invalidité du consentement",
    },
  },
  consentment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a fourni son consentement",
    },
  },
  imageRight: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a fourni son consentement de droit à l'image ",
    },
  },
  imageRightFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement de droit à l'image",
    },
  },
  imageRightFilesStatus: {
    type: String,
    enum: ["TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"],
    default: "TO_UPLOAD",
    documentation: {
      description: "Status du fichier consentement de droit à l'image ",
    },
  },

  imageRightFilesComment: {
    type: String,
    documentation: {
      description: "Commentaire du status WAITING_CORRECTION consentement de droit à l'image ",
    },
  },

  autoTestPCR: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal a fourni son consentement d'autotest PCR ",
    },
  },
  autoTestPCRFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement d'autotest PCR",
    },
  },
  autoTestPCRFilesStatus: {
    type: String,
    enum: ["TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"],
    default: "TO_UPLOAD",
    documentation: {
      description: "Status du fichier consentement d'autotest PCR",
    },
  },

  autoTestPCRFilesComment: {
    type: String,
    documentation: {
      description: "Commentaire du status WAITING_CORRECTION consentement d'autotest PCR",
    },
  },

  rulesYoung: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a accepté le règlement intérieur ",
    },
  },
  rulesParent1: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal 1 a accepté le règlement intérieur ",
    },
  },
  rulesParent2: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal  2 a accepté le règlement intérieur ",
    },
  },
  rulesFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichiers : règlement intérieur",
    },
  },

  informationAccuracy: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire certifie l'exactitude des renseignements fournis",
    },
  },
  aknowledgmentTerminaleSessionAvailability: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a pris connaissance des règles de disponibilité liées au rattrapage du bac",
    },
  },
  parentStatementOfHonorInvalidId: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant a fait une déclaration sur l'honneur qu'il allait mettre à jour la CNI du volontaire.",
    },
  },

  // * JDC
  jdc: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a déjà réalisé sa JDC",
    },
  },

  // * Motivations
  motivations: {
    type: String,
    documentation: {
      description: "Motivations du volontaire à rejoindre le SNU",
    },
  },

  // * Preferences
  domains: {
    type: [String],
    default: [],
    documentation: {
      description: "3 domaines privilégiés",
    },
  },
  professionnalProject: {
    type: String,
    enum: ["UNIFORM", "OTHER", "UNKNOWN"],
    documentation: {
      description: "Projet professionnel",
    },
  },
  professionnalProjectPrecision: {
    type: String,
    documentation: {
      description: "Information supplémentaire sur le projet professionnel du volontaire",
    },
  },
  period: {
    type: String,
    enum: ["WHENEVER", "DURING_HOLIDAYS", "DURING_SCHOOL"],
    documentation: {
      description: "Période privilégiée pour réaliser des missions",
    },
  },
  periodRanking: {
    type: [String],
    documentation: {
      description: "Classement des périodes",
    },
  },
  mobilityNearSchool: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de son établissement",
    },
  },
  mobilityNearHome: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de son domicile",
    },
  },
  mobilityNearRelative: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de l'adresse d'un de ses proches",
    },
  },
  mobilityNearRelativeName: {
    type: String,
    documentation: {
      description: "Nom du proche",
    },
  },
  mobilityNearRelativeAddress: {
    type: String,
    documentation: {
      description: "Adresse du proche",
    },
  },
  mobilityNearRelativeZip: {
    type: String,
    documentation: {
      description: "Code postal du proche",
    },
  },
  mobilityNearRelativeCity: {
    type: String,
    documentation: {
      description: "Ville du proche",
    },
  },
  mobilityTransport: {
    type: [String],
    documentation: {
      description: "Type de transport privilégié par le volontaire",
    },
  },
  mobilityTransportOther: {
    type: String,
    documentation: {
      description: "Autre type de transport privilégié par le volontaire",
    },
  },
  missionFormat: {
    type: String,
    enum: ["CONTINUOUS", "DISCONTINUOUS"],
    documentation: {
      description: "Format de mission privilégié",
    },
  },
  engaged: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est engagé dans une structrue en dehors du SNU",
    },
  },
  engagedDescription: {
    type: String,
    documentation: {
      description: "Description de l'engagement du volontaire en dehors du SNU ",
    },
  },
  desiredLocation: {
    type: String,
    documentation: {
      description: "",
    },
  },

  // preparation militaire
  militaryPreparationFilesIdentity: {
    type: [String],
    default: [],
  },
  militaryPreparationFilesCensus: {
    type: [String],
    default: [],
  },
  militaryPreparationFilesAuthorization: {
    type: [String],
    default: [],
  },
  militaryPreparationFilesCertificate: {
    type: [String],
    default: [],
  },
  statusMilitaryPreparationFiles: {
    type: String,
    enum: ["VALIDATED", "WAITING_VERIFICATION", "WAITING_CORRECTION", "REFUSED"],
  },
  militaryPreparationCorrectionMessage: {
    type: String,
    documentation: {
      description: "Message de correction du dossier de préparation militaire",
    },
  },

  files: {
    cniFiles: [File],
    highSkilledActivityProofFiles: [File],
    dataProcessingConsentmentFiles: [File],
    parentConsentmentFiles: [File],
    imageRightFiles: [File],
    autoTestPCRFiles: [File],
    rulesFiles: [File],
    militaryPreparationFilesIdentity: [File],
    militaryPreparationFilesCensus: [File],
    militaryPreparationFilesAuthorization: [File],
    militaryPreparationFilesCertificate: [File],
  },

  latestCNIFileExpirationDate: {
    type: Date,
    documentation: {
      description: "Date d'expiration du fichier le plus récent dans files.cniFiles",
    },
  },

  CNIFileNotValidOnStart: {
    type: String,
    enum: ["false", "true"],
    documentation: {
      description: "Date d'expiration de la CNI File non valide au début de la Cohorte",
    },
  },

  latestCNIFileCategory: {
    type: String,
    enum: ["cniOld", "cniNew", "passport", "deleted"],
    documentation: {
      description: "Catégorie du fichier le plus récent dans files.cniFiles",
    },
  },

  missionsInMail: {
    type: [
      {
        missionId: String,
        date: { type: Date, default: Date.now },
      },
    ],
    documentation: {
      description: "Liste des missions pour lesquelles le volontaire a déjà été notifié (identifiant + date de notification)",
    },
  },

  youngPhase1Agreement: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Le volontaire a accepté les conditions de la phase 1",
    },
  },

  status_equivalence: {
    type: String,
    documentation: {
      description: "Statut de la dernière demande d'équivalence phase 2",
    },
  },

  // --- demandes de corrections : phase 0
  correctionRequests: {
    type: [CorrectionRequest],
    default: undefined,
    documentation: {
      description: "Liste des demandes de corrections faites sur le dossier du jeune.",
    },
  },
  notes: {
    type: [Note],
    documentation: {
      description: "Liste des notes faites sur le dossier du jeune.",
    },
  },

  hasNotes: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      documentation: "Le volontaire a des notes",
    },
  },

  // TODO : clean interests
  defenseInterest: { type: String },
  defenseTypeInterest: { type: String },
  defenseDomainInterest: { type: String },
  defenseMotivationInterest: { type: String },
  securityInterest: { type: String },
  securityDomainInterest: { type: String },
  solidarityInterest: { type: String },
  healthInterest: { type: String },
  educationInterest: { type: String },
  cultureInterest: { type: String },
  sportInterest: { type: String },
  environmentInterest: { type: String },
  citizenshipInterest: { type: String },

  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

schema.methods.comparePassword = async function (p) {
  const user = await YoungModel.findById(this._id).select("password");
  return bcrypt.compare(p, user?.password || "");
};

schema.methods.anonymise = function () {
  return anonymize(this);
};

//Sync with brevo
schema.post<SchemaExtended>("save", async function (doc) {
  //TODO ajouter la transaction
  if (doc.source === YOUNG_SOURCE.CLE && doc.status === YOUNG_STATUS.VALIDATED) {
    await ClasseStateManager.compute(doc.classeId, doc._user, { YoungModel });
  }

  if (config.ENVIRONMENT === "test") return;
  brevo.sync(doc, MODELNAME);
});
schema.post("findOneAndUpdate", function (doc) {
  brevo.sync(doc, MODELNAME);
});
schema.post("remove", function (doc) {
  brevo.unsync(doc);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
  this.updatedAt = new Date();
  this.previousStatus = this.status; // Used to compute classe if a young CLE has a change in status (see post save hook)
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
    "/phase3Token",
    "/loginAttempts",
    "/updatedAt",
    "/statusPhase2UpdatedAt",
    "/statusPhase3UpdatedAt",
    "/statusPhase2ValidatedAt",
    "/statusPhase3ValidatedAt",
    "/userIps",
    "/token2FA",
    "/token2FAExpires",
  ],
});

schema.plugin(
  mongooseElastic(esClient, {
    selectiveIndexing: true,
    ignore: [
      "historic",
      "missionsInMail",
      "password",
      "lastLogoutAt",
      "passwordChangedAt",
      "nextLoginAttemptIn",
      "forgotPasswordResetToken",
      "forgotPasswordResetExpires",
      "invitationExpires",
      "phase3Token",
      "loginAttempts",
      "parent1Inscription2023Token",
      "parent2Inscription2023Token",
      "updatedAt",
      "lastActivityAt",
      "userIps",
      "token2FA",
      "token2FAExpires",
    ],
  }),
  MODELNAME,
);

schema.index({ ligneId: 1 });
schema.index({ sessionPhase1Id: 1 });
schema.index({ sessionPhase1Id: 1, status: 1 });
schema.index({ classeId: -1 });

export type YoungType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type YoungDocument<T = {}> = DocumentExtended<YoungType & T>;
type SchemaExtended = YoungDocument & UserExtension & { previousStatus?: YoungType["status"] };

export const YoungModel = mongoose.model<YoungDocument>(MODELNAME, schema);
