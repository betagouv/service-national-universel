const mongoose = require("mongoose");

const MODELNAME = "stats-young-center";

const Schema = new mongoose.Schema({
  young__id: {
    type: String,
  },
  center__id: {
    type: String,
  },

  young_firstName: {
    type: String,
    documentation: {
      description: "Prénom du volontaire",
    },
  },
  young_lastName: {
    type: String,
    documentation: {
      description: "Nom du volontaire",
    },
  },
  young_birthCountry: {
    type: String,
    documentation: {
      description: "Pays de naissance",
    },
  },
  young_birthCity: {
    type: String,
    documentation: {
      description: "La ville de naissance du volontaire",
    },
  },
  young_email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    documentation: {
      description: "E-mail du volontaire",
    },
  },
  young_gender: {
    type: String,
    documentation: {
      description: "Sexe",
    },
  },
  young_birthdateAt: {
    type: Date,
    documentation: {
      description: "Date de naissance du volontaire",
    },
  },
  young_cohort: {
    type: String,
    default: "2022",
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2022", "2021", "2020", "2019", "à venir"],
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
  young_phase: {
    type: String,
    default: "INSCRIPTION",
    enum: ["INSCRIPTION", "COHESION_STAY", "INTEREST_MISSION", "CONTINUE"],
    documentation: {
      description: "Phase actuelle du volontaire",
    },
  },
  young_status: {
    type: String,
    default: "IN_PROGRESS",
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST", "NOT_ELIGIBLE", "ABANDONED"],
    documentation: {
      description: "Statut général du volontaire",
    },
  },
  young_statusPhase1: {
    type: String,
    default: "WAITING_AFFECTATION",
    enum: ["AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"],
    documentation: {
      description: "Statut du volontaire lié à la première phase",
    },
  },
  young_statusPhase2: {
    type: String,
    default: "WAITING_REALISATION",
    enum: ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED", "WITHDRAWN"],
    documentation: {
      description: "Statut du volontaire lié à la seconde phase",
    },
  },
  young_statusPhase3: {
    type: String,
    default: "WAITING_REALISATION",
    enum: ["WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED", "WITHDRAWN"],
    documentation: {
      description: "Statut du volontaire lié à la troisième phase",
    },
  },
  young_lastStatusAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière modification d'un statut",
    },
  },

  young_lastLoginAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière connexion",
    },
  },
  young_acceptCGU: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "Le volontaire a accepté les CGU",
    },
  },

  // * phase1 infos
  young_cohesionStayPresence: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "Le volontaire était présent lors du séjour de cohésion",
    },
  },
  young_cohesionStayMedicalFileReceived: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "La fiche sanitaire a été reçu par le SNU",
    },
  },
  young_sessionPhase1Id: {
    type: String,
    documentation: {
      description: "Id de la session de cohésion d'accueil pour la phase 1",
    },
  },
  young_sessionPhase1IdTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },
  young_codeCenterTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },
  young_busTmp: {
    type: String,
    documentation: {
      description: "TODO",
    },
  },

  young_meetingPointId: {
    type: String,
    documentation: {
      description: "Identifiant du point de rassemblement pour le sejour de cohesion",
    },
  },
  young_deplacementPhase1Autonomous: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Le volontaire se rend au centre de cohésion par ses propres moyens ",
    },
  },

  // * address
  young_address: {
    type: String,
    documentation: {
      description: "Adresse pendant le snu du volontaire",
    },
  },
  young_complementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse pendant le snu du volontaire",
    },
  },
  young_zip: {
    type: String,
    documentation: {
      description: "Code postal pendant le snu du volontaire",
    },
  },
  young_city: {
    type: String,
    documentation: {
      description: "Ville pendant le snu du volontaire",
    },
  },
  young_addressVerified: {
    type: String,
    documentation: {
      description: "Adresse validée",
    },
  },
  young_cityCode: {
    type: String,
    documentation: {
      description: "Code pendant le snu insee de la ville",
    },
  },
  young_populationDensity: {
    type: String,
    enum: ["TRES PEU DENSE", "PEU DENSE", "INTERMEDIAIRE", "DENSE", ""],
    documentation: {
      description: "Densité de la ville  pendant le snu du volontaire",
    },
  },
  young_department: {
    type: String,
    documentation: {
      description: "Département pendant le snu du volontaire",
    },
  },
  young_region: {
    type: String,
    documentation: {
      description: "Région pendant le snu du volontaire",
    },
  },
  young_country: {
    type: String,
    documentation: {
      description: "Pays de résidence pendant le snu du volontaire",
    },
  },
  young_qpv: {
    type: String,
    enum: ["true", "false", ""],
    default: "",
    documentation: {
      description: "Le volontaire est dans un Quarier Prioritaire pendant le snu",
    },
  },
  young_foreignAddress: {
    type: String,
    documentation: {
      description: "Adresse à l'étranger du volontaire",
    },
  },
  young_foreignCity: {
    type: String,
    documentation: {
      description: "Ville à l'étranger du volontaire",
    },
  },
  young_foreignZip: {
    type: String,
    documentation: {
      description: "Code postal à l'étranger du volontaire",
    },
  },
  young_foreignCountry: {
    type: String,
    documentation: {
      description: "Pays à l'étranger du volontaire",
    },
  },

  // * School informations
  young_situation: {
    type: String,
    documentation: {
      description: "Situation scolaire / professionnel du volontaire",
    },
  },
  young_grade: {
    type: String,
    documentation: {
      description: "Niveau scolaire du volontaire, si applicable",
    },
  },
  young_schoolCertification: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "",
    },
  },
  young_schooled: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est scolarisé",
    },
  },
  young_schoolName: {
    type: String,
    documentation: {
      description: "Nom de l'établissement du volontaire",
    },
  },
  young_schoolType: {
    type: String,
    documentation: {
      description: "Type de l'établissement du volontaire",
    },
  },
  young_schoolZip: {
    type: String,
    documentation: {
      description: "Code postal de l'établissement du volontaire",
    },
  },
  young_schoolCity: {
    type: String,
    documentation: {
      description: "Ville de l'établissement du volontaire",
    },
  },
  young_schoolDepartment: {
    type: String,
    documentation: {
      description: "Département de l'établissement du volontaire",
    },
  },
  young_schoolRegion: {
    type: String,
    documentation: {
      description: "Région de l'établissement du volontaire",
    },
  },
  young_schoolCountry: {
    type: String,
    documentation: {
      description: "Pays de l'établissement du volontaire",
    },
  },
  young_academy: {
    type: String,
    documentation: {
      description: "Académie du volontaire (en fonction de son domicile)",
    },
  },

  // * Situations pro
  young_employed: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est employé",
    },
  },

  // * Hébergeur
  young_hostCity: {
    type: String,
    documentation: {
      description: "Ville de l'hébergeur",
    },
  },
  young_hostZip: {
    type: String,
    documentation: {
      description: "Code postale de la ville de l'hébergeur",
    },
  },
  young_hostAddress: {
    type: String,
    documentation: {
      description: "Adresse de l'hébergeur",
    },
  },
  young_hostDepartment: {
    type: String,
    documentation: {
      description: "Departement de l'hébergeur",
    },
  },
  young_hostRegion: {
    type: String,
    documentation: {
      description: "Région de l'hébergeur",
    },
  },
  // * Situations particulières
  young_handicap: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a un handicap",
    },
  },
  young_allergies: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a des allergies",
    },
  },
  young_handicapInSameDepartment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire souhaite être affecté dans son département",
    },
  },
  young_reducedMobilityAccess: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a besoin d’un aménagement pour mobilité réduite",
    },
  },
  young_ppsBeneficiary: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "le volontaire bénéficie d'un PPS (projet personnalisé de scolarisation)",
    },
  },
  young_paiBeneficiary: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire bénéficie d'un PAI (projet d'accueil individualisé)",
    },
  },

  young_medicosocialStructure: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est suivi par une structure médicosociale",
    },
  },

  young_specificAmenagment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a besoin d'aménagements spécifiques",
    },
  },

  young_highSkilledActivity: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire pratique une activité de haut niveau",
    },
  },
  young_highSkilledActivityInSameDepartment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire pratique une activité de haut niveau et souhaite etre affecté dans son département pour la phase 1",
    },
  },

  // * Consentements
  young_parentConsentment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Les représentants ont fourni leur consentement",
    },
  },
  young_consentment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a fourni son consentement",
    },
  },
  young_imageRight: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a fourni son consentement de droit à l'image ",
    },
  },
  young_autoTestPCR: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal a fourni son consentement d'autotest PCR ",
    },
  },
  young_rulesYoung: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a accepté le règlement intérieur ",
    },
  },

  // * JDC
  young_jdc: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a déjà réalisé sa JDC",
    },
  },

  // * Preferences
  young_mobilityTransport: {
    type: [String],
    documentation: {
      description: "Type de transport privilégié par le volontaire",
    },
  },

  //! COHESION CENTER

  center_name: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  center_code: {
    type: String,
    documentation: {
      description: "Code du centre",
    },
  },
  center_code2022: {
    type: String,
    documentation: {
      description: "Code du centre utilisé en 2022",
    },
  },
  center_country: {
    type: String,
    documentation: {
      description: "Pays du centre",
    },
  },
  center_COR: {
    type: String,
    documentation: {
      description: "",
    },
  },
  center_address: {
    type: String,
    documentation: {
      description: "Adresse du centre",
    },
  },
  center_city: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  center_zip: {
    type: String,
    documentation: {
      description: "Code postal du centre",
    },
  },
  center_department: {
    type: String,
    documentation: {
      description: "Départment du centre",
    },
  },
  center_region: {
    type: String,
    documentation: {
      description: "Région du centre",
    },
  },
  center_outfitDelivered: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  center_observations: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  center_waitingList: {
    type: [String],
    documentation: {
      description: "Liste ordonnée des jeunes en liste d'attente sur ce cente de cohésion",
    },
  },
  center_pmr: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Accessibilité aux personnes à mobilité réduite",
    },
  },
  center_cohorts: {
    type: [String],
    documentation: {
      description: "Liste des cohortes concernées par ce centre de cohésion",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
