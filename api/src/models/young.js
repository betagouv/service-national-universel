const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const sendinblue = require("../sendinblue");
const zammad = require("../zammad");

const MODELNAME = "young";

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
    default: "2021",
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021", "2020", "2019"],
    documentation: {
      description: "Cohorte",
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
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST"],
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
  lastStatusAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière modification d'un statut",
    },
  },
  withdrawnMessage: {
    type: String,
    documentation: {
      description: "Message écrit lors de l'abandon du SNU.",
    },
  },

  // keep track of the current inscription step
  inscriptionStep: {
    type: String,
    default: "COORDONNEES", // if the young is created, it passed the first step, so default is COORDONNEES
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "AVAILABILITY", "DONE"],
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
  lastLoginAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière connexion",
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
    default: "",
    documentation: {
      description: "Le volontaire était présent lors du séjour de cohésion",
    },
  },
  cohesionStayMedicalFileReceived: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "La fiche sanitaire a été reçu par le SNU",
    },
  },
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
      description: "Adresse du volontaire",
    },
  },
  complementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse du volontaire",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal du volontaire",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville du volontaire",
    },
  },
  cityCode: {
    type: String,
    documentation: {
      description: "Code insee de la ville",
    },
  },
  populationDensity: {
    type: String,
    enum: ["TRES PEU DENSE", "PEU DENSE", "INTERMEDIAIRE", "DENSE"],
    documentation: {
      description: "tres peu dense, peu dense, intermediaire, tres dense",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département du volontaire",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région du volontaire",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays de résidence du volontaire",
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
      description: "Le volontaire est dans un Quarier Prioritaire",
    },
  },
  populationDensity: {
    type: String,
    default: "",
    documentation: {
      description: "Densité de population du domicile du volontaire (ZRR - zone rurale)",
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
  hostRelationship: {
    type: String,
    documentation: {
      description: "Lien de l'hébergeur avec le volontaire",
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
    enum: ["DURING_HOLIDAYS", "DURING_SCHOOL"],
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
    enum: ["VALIDATED", "WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "WAITING_UPLOAD"],
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
  zammad.sync(doc, MODELNAME);
});
Schema.post("findOneAndUpdate", function (doc) {
  sendinblue.sync(doc, MODELNAME);
  zammad.sync(doc, MODELNAME);
});
Schema.post("remove", function (doc) {
  sendinblue.unsync(doc);
  zammad.unsync(doc);
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
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
    "/forgotPasswordResetToken",
    "/forgotPasswordResetExpires",
    "/invitationToken",
    "/invitationExpires",
    "/phase3Token",
  ],
});
Schema.plugin(mongooseElastic(esClient, { ignore: ["historic"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
