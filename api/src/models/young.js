const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const sendinblue = require("../sendinblue");
const { ENVIRONMENT } = require("../config");

const MODELNAME = "young";

const File = new mongoose.Schema({
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
  category: String,
  expirationDate: Date,
});

const Schema = new mongoose.Schema({
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
    documentation: {
      description: "E-mail du volontaire",
    },
  },
  phone: {
    type: String,
    documentation: {
      description: "Numéro de télephone du volontaire",
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
    enum: [
      "Juillet 2023",
      "Juin 2023",
      "Avril 2023 - B",
      "Avril 2023 - A",
      "Février 2023 - C",
      "Juillet 2022",
      "Juin 2022",
      "Février 2022",
      "2022",
      "2021",
      "2020",
      "2019",
      "à venir",
    ],
    documentation: {
      description: "Cohorte",
    },
  },
  originalCohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2022", "2021", "2020", "2019", "à venir"],
    documentation: {
      description: "Cohorte d'origine du volontaire, dans le cas ou il a changé de cohorte après sa validation",
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
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST", "NOT_ELIGIBLE", "ABANDONED", "NOT_AUTORISED"],
    documentation: {
      description: "Statut général du volontaire",
    },
  },

  statusPhase1: {
    type: String,
    default: "WAITING_AFFECTATION",
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

  reinscriptionStep2023: {
    type: String,
    enum: ["ELIGIBILITE", "NONELIGIBLE", "SEJOUR", "DOCUMENTS", "DONE"],
    documentation: {
      description: "Étape du tunnel de réinscription",
    },
  },

  inscriptionStep2023: {
    type: String,
    default: "COORDONNEES",
    enum: ["COORDONNEES", "CONSENTEMENTS", "REPRESENTANTS", "DOCUMENTS", "DONE", "CONFIRM", "WAITING_CONSENT"],
    documentation: {
      description: "Étape du tunnel d'inscription",
    },
  },

  // keep track of the current inscription step
  inscriptionStep: {
    type: String,
    default: "COORDONNEES", // if the young is created, it passed the first step, so default is COORDONNEES
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "AVAILABILITY", "DONE", "DOCUMENTS"],
    documentation: {
      description: "Étape du tunnel d'inscription",
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

  // * phase 2 application infos
  phase2ApplicationStatus: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des statuts des candidatures de phase 2 pour le jeune",
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
    enum: ["true", "false", ""],
    default: "",
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = async function (p) {
  const user = await OBJ.findById(this._id).select("password");
  return bcrypt.compare(p, user.password || "");
};

//Sync with sendinblue
Schema.post("save", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("findOneAndUpdate", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("remove", function (doc) {
  sendinblue.unsync(doc);
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
  this.updatedAt = Date.now();
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
  excludes: [
    "/password",
    "/lastLoginAt",
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
  ],
});

Schema.plugin(
  mongooseElastic(esClient, {
    ignore: [
      "historic",
      "missionsInMail",
      "password",
      "nextLoginAttemptIn",
      "forgotPasswordResetToken",
      "forgotPasswordResetExpires",
      "invitationExpires",
      "phase3Token",
      "loginAttempts",
      "parent1Inscription2023Token",
      "parent2Inscription2023Token",
    ],
  }),
  MODELNAME,
);

Schema.index({ sessionPhase1Id: 1 });
Schema.index({ sessionPhase1Id: 1, status: 1 });

const OBJ = mongoose.model(MODELNAME, Schema);
if (ENVIRONMENT === "production") OBJ.syncIndexes();

module.exports = OBJ;
