const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const sendinblue = require("../sendinblue");

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
    enum: ["2021", "2020", "2019"],
    documentation: {
      description: "Cohorte",
    },
  },
  phase: {
    type: String,
    default: "INSCRIPTION",
    enum: ["INSCRIPTION", "COHESION_STAY", "INTEREST_MISSION"],
    documentation: {
      description: "Phase actuelle du volontaire",
    },
  },
  status: {
    type: String,
    default: "IN_PROGRESS",
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED"],
    documentation: {
      description: "Statut général du volontaire",
    },
  },
  statusPhase1: {
    type: String,
    default: "WAITING_AFFECTATION",
    enum: ["AFFECTED", "WAITING_AFFECTATION", "CANCEL", "DONE", "NOT_DONE"],
    documentation: {
      description: "Statut du volontaire lié à la première phase",
    },
  },
  statusPhase2: {
    type: String,
    default: "WAITING_REALISATION",
    enum: ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED"],
    documentation: {
      description: "Statut du volontaire lié à la seconde phase",
    },
  },
  statusPhase3: {
    type: String,
    default: "WAITING_REALISATION",
    enum: ["WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED"],
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
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "DONE"],
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
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire était présent lors du séjour de cohésion",
    },
  },
  cohesionStayMedicalFileReceived: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "La fiche sanitaire a été reçu par le SNU",
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

  // * Situations particulières
  handicap: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a un handicap",
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

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
