const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const sendinblue = require("../sendinblue");
const zammad = require("../zammad");

const MODELNAME = "young";

const Schema = new mongoose.Schema({
  young_sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "Identifiant dans l'ancienne base de données",
    },
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
  young_frenchNationality: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est de nationalité française",
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
  young_birthCityZip: {
    type: String,
    documentation: {
      description: "Le code postal de la ville de naissance du volontaire",
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
  young_phone: {
    type: String,
    documentation: {
      description: "Numéro de télephone du volontaire",
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
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2022", "2021", "2020", "2019"],
    documentation: {
      description: "Cohorte",
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
    enum: ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "WITHDRAWN", "DELETED", "WAITING_LIST", "NOT_ELIGIBLE"],
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
  young_statusPhase1Motif: {
    type: String,
    enum: ["ILLNESS", "DEATH", "ADMINISTRATION_CANCEL", "OTHER"],
    documentation: {
      description: "Motif du statut du volontaire lié à la première phase",
    },
  },
  young_statusPhase1MotifDetail: {
    type: String,
    documentation: {
      description: "Détail du motif du statut du volontaire lié à la première phase",
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
  young_statusPhase2UpdatedAt: {
    type: Date,
    documentation: {
      description: "Date de dernière modification du statut lié à la seconde phase",
    },
  },
  young_statusPhase2Contract: {
    type: [String],
    default: [],
    enum: ["NONE", "DRAFT", "SENT", "VALIDATED"],
    documentation: {
      description: "Statut du contrat d'engagement du volontaire (cf: modèle contrat)",
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
  young_withdrawnReason: {
    type: String,
    documentation: {
      description: "Motif lors de l'abandon du SNU.",
    },
  },
  young_withdrawnMessage: {
    type: String,
    documentation: {
      description: "Message écrit lors de l'abandon du SNU.",
    },
  },

  // keep track of the current inscription step
  young_inscriptionStep: {
    type: String,
    default: "COORDONNEES", // if the young is created, it passed the first step, so default is COORDONNEES
    enum: ["PROFIL", "COORDONNEES", "PARTICULIERES", "REPRESENTANTS", "CONSENTEMENTS", "MOTIVATIONS", "AVAILABILITY", "DONE", "DOCUMENTS"],
    documentation: {
      description: "Étape du tunnel d'inscription",
    },
  },

  // keep track of the current cohesion inscription step for 2020 users
  young_cohesion2020Step: {
    type: String,
    default: "CONSENTEMENTS",
    enum: ["CONSENTEMENTS", "COORDONNEES", "PARTICULIERES", "JDC", "DONE"],
    documentation: {
      description: "Étape du tunnel d'inscription sur le formulaire allégé (uniquement disponible pour la cohorte 2020)",
    },
  },
  // Inscription status message
  young_inscriptionCorrectionMessage: {
    type: String,
    documentation: {
      description: "Message envoyé au volontaire dans le cas où son inscription nécessite des corrections.",
    },
  },
  young_inscriptionRefusedMessage: {
    type: String,
    documentation: {
      description: "Message envoyé au volontaire dans le cas où son inscription est refusée.",
    },
  },

  // userName and userId because it can be a young or a referent
  young_historic: {
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

  young_password: {
    type: String,
    select: false,
    documentation: {
      description: "Mot de passe du volontaire",
    },
  },
  young_lastLoginAt: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernière connexion",
    },
  },
  young_forgotPasswordResetToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la réinitialisation du mot de passe",
    },
  },
  young_forgotPasswordResetExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token pour réinitialiser le mot de passe",
    },
  },
  young_invitationToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token d'invitation",
    },
  },
  young_invitationExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token d'invitation",
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
  young_cniFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichiers - Pièces d'identité",
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
  // *** START LEGACY COHESION CENTER ***
  // phase1 legacy infos, we keep it for retrocompatibility, can be deleted in the future
  young_youngCohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion d'accueil pour la phase 1",
    },
  },
  young_cohesionCenterName: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  young_cohesionCenterZip: {
    type: String,
    documentation: {
      description: "Code postal du centre de cohésion d'accueil pour la phase 1",
    },
  },
  young_cohesionCenterCity: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  // *** END LEGACY COHESION CENTER ***

  young_autoAffectationPhase1ExpiresAt: {
    type: Date,
    documentation: {
      description: "Date limite de réponse a la participation à la phase 1",
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

  // * phase 2 application infos
  young_phase2ApplicationStatus: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des statuts des candidatures de phase 2 pour le jeune",
    },
  },

  young_phase2NumberHoursDone: {
    type: String,
    documentation: {
      description: "Somme des heures de mission effectuées",
    },
  },
  young_phase2NumberHoursEstimated: {
    type: String,
    documentation: {
      description: "Sommes des heures de mission prévisionnelles",
    },
  },

  // * phase 3 infos
  young_phase3StructureName: { type: String },
  young_phase3MissionDomain: { type: String },
  young_phase3MissionDescription: { type: String },
  young_phase3MissionStartAt: { type: Date },
  young_phase3MissionEndAt: { type: Date },

  young_phase3TutorFirstName: { type: String },
  young_phase3TutorLastName: { type: String },
  young_phase3TutorEmail: { type: String },
  young_phase3TutorPhone: { type: String },
  young_phase3TutorNote: { type: String },

  young_phase3Token: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la validation de la phase 3",
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
  young_location: {
    lat: { type: Number },
    lon: { type: Number },
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
  young_schoolAddress: {
    type: String,
    documentation: {
      description: "Adresse de l'établissement du volontaire",
    },
  },
  young_schoolComplementAdresse: {
    type: String,
    documentation: {
      description: "Complément d'adresse de l'établissement du volontaire",
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
  young_schoolLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },
  young_schoolId: {
    type: String,
    documentation: {
      description: "Identifiant de l'établissement du volontaire",
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

  // * Parents et représentants
  young_parent1Status: {
    type: String,
    documentation: {
      description: "Statut légal du parent 1",
    },
  },
  young_parent1FirstName: {
    type: String,
    documentation: {
      description: "Prénom du parent 1",
    },
  },
  young_parent1LastName: {
    type: String,
    documentation: {
      description: "Nom du parent 1",
    },
  },
  young_parent1Email: {
    type: String,
    documentation: {
      description: "E-mail du parent 1",
    },
  },
  young_parent1Phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone du parent 1",
    },
  },
  young_parent1OwnAddress: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 1 a sa propre adresse. Elle est différent de celle du volontaire",
    },
  },
  young_parent1Address: {
    type: String,
    documentation: {
      description: "Adresse du parent 1",
    },
  },
  young_parent1ComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse du parent 1",
    },
  },
  young_parent1Zip: {
    type: String,
    documentation: {
      description: "Code postal du parent 1",
    },
  },
  young_parent1City: {
    type: String,
    documentation: {
      description: "Ville du parent 1",
    },
  },
  young_parent1Department: {
    type: String,
    documentation: {
      description: "Département du parent 1",
    },
  },
  young_parent1Region: {
    type: String,
    documentation: {
      description: "Région du parent 1",
    },
  },
  young_parent1Country: {
    type: String,
    documentation: {
      description: "Pays du parent 1",
    },
  },
  young_parent1Location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  young_parent1FromFranceConnect: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Le parent 1 s'est identifié via France Connect",
    },
  },

  young_parent2Status: {
    type: String,
    documentation: {
      description: "Statut légal du parent 2",
    },
  },
  young_parent2FirstName: {
    type: String,
    documentation: {
      description: "Prénom du parent 2",
    },
  },
  young_parent2LastName: {
    type: String,
    documentation: {
      description: "Nom du parent 2",
    },
  },
  young_parent2Email: {
    type: String,
    documentation: {
      description: "E-mail du parent 2",
    },
  },
  young_parent2Phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone du parent 2",
    },
  },
  young_parent2OwnAddress: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le parent 2 a sa propre adresse. Elle est différent de celle du volontaire",
    },
  },
  young_parent2Address: {
    type: String,
    documentation: {
      description: "Adresse du parent 2",
    },
  },
  young_parent2ComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse du parent 2",
    },
  },
  young_parent2Zip: {
    type: String,
    documentation: {
      description: "Code postal du parent 2",
    },
  },
  young_parent2City: {
    type: String,
    documentation: {
      description: "Ville du parent 2",
    },
  },
  young_parent2Department: {
    type: String,
    documentation: {
      description: "Département du parent 2",
    },
  },
  young_parent2Region: {
    type: String,
    documentation: {
      description: "Région du parent 2",
    },
  },
  young_parent2Country: {
    type: String,
    documentation: {
      description: "Pays du parent 2",
    },
  },
  young_parent2Location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  young_parent2FromFranceConnect: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Le parent 2 s'est identifié via France Connect",
    },
  },

  // * Hébergeur
  young_hostLastName: {
    type: String,
    documentation: {
      description: "Nom de l'hébergeur",
    },
  },
  young_hostFirstName: {
    type: String,
    documentation: {
      description: "Prénom de l'hébergeur",
    },
  },
  young_hostRelationship: {
    type: String,
    documentation: {
      description: "Lien de l'hébergeur avec le volontaire",
    },
  },
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
  young_medicosocialStructureName: {
    type: String,
    documentation: {
      description: "Nom de la structure médicosociale",
    },
  },
  young_medicosocialStructureAddress: {
    type: String,
    documentation: {
      description: "Adresse de la structure médicosociale",
    },
  },
  young_medicosocialStructureComplementAddress: {
    type: String,
    documentation: {
      description: "Complément d'adresse de la structure médicosociale",
    },
  },
  young_medicosocialStructureZip: {
    type: String,
    documentation: {
      description: "Code postal de la structure médicosociale",
    },
  },
  young_medicosocialStructureCity: {
    type: String,
    documentation: {
      description: "Ville de la structure médicosociale",
    },
  },
  young_medicosocialStructureDepartment: {
    type: String,
    documentation: {
      description: "Département de la structure médicosociale",
    },
  },
  young_medicosocialStructureRegion: {
    type: String,
    documentation: {
      description: "Région de la structure médicosociale",
    },
  },
  young_medicosocialStructureLocation: {
    lat: { type: Number },
    lon: { type: Number },
  },

  young_engagedStructure: {
    type: String,
    documentation: {
      description: "Structure dans laquelle le volontaire est engagée en dehors du SNU",
    },
  },
  young_specificAmenagment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a besoin d'aménagements spécifiques",
    },
  },
  young_specificAmenagmentType: {
    type: String,
    documentation: {
      description: "Type d'aménagements spécifiques",
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
  young_highSkilledActivityType: {
    type: String,
    documentation: {
      description: "Type de l'activité de haut niveau",
    },
  },
  young_highSkilledActivityProofFiles: {
    type: [String],
    documentation: {
      description: "Fichier prouvant l'activité de haut niveau",
    },
  },

  // * Consentements
  young_dataProcessingConsentmentFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement au traitement des données personnelles",
    },
  },
  young_parentConsentment: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Les représentants ont fourni leur consentement",
    },
  },
  young_parentConsentmentFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement des représentants",
    },
  },
  young_parentConsentmentFilesCompliant: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Consentement invalide",
    },
  },
  young_parentConsentmentFilesCompliantInfo: {
    type: String,
    documentation: {
      description: "Information supplémentaire sur l'invalidité du consentement",
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
  young_imageRightFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement de droit à l'image",
    },
  },
  young_autoTestPCR: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal a fourni son consentement d'autotest PCR ",
    },
  },
  young_autoTestPCRFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichier : Formulaire de consentement d'autotest PCR",
    },
  },
  young_rulesYoung: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a accepté le règlement intérieur ",
    },
  },
  young_rulesParent1: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal 1 a accepté le règlement intérieur ",
    },
  },
  young_rulesParent2: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le representant légal  2 a accepté le règlement intérieur ",
    },
  },
  young_rulesFiles: {
    type: [String],
    default: [],
    documentation: {
      description: "Fichiers : règlement intérieur",
    },
  },
  young_informationAccuracy: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire certifie l'exactitude des renseignements fournis",
    },
  },
  young_aknowledgmentTerminaleSessionAvailability: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire a pris connaissance des règles de disponibilité liées au rattrapage du bac",
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

  // * Motivations
  young_motivations: {
    type: String,
    documentation: {
      description: "Motivations du volontaire à rejoindre le SNU",
    },
  },

  // * Preferences
  young_domains: {
    type: [String],
    default: [],
    documentation: {
      description: "3 domaines privilégiés",
    },
  },
  young_professionnalProject: {
    type: String,
    enum: ["UNIFORM", "OTHER", "UNKNOWN"],
    documentation: {
      description: "Projet professionnel",
    },
  },
  young_professionnalProjectPrecision: {
    type: String,
    documentation: {
      description: "Information supplémentaire sur le projet professionnel du volontaire",
    },
  },
  young_period: {
    type: String,
    enum: ["DURING_HOLIDAYS", "DURING_SCHOOL"],
    documentation: {
      description: "Période privilégiée pour réaliser des missions",
    },
  },
  young_periodRanking: {
    type: [String],
    documentation: {
      description: "Classement des périodes",
    },
  },
  young_mobilityNearSchool: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de son établissement",
    },
  },
  young_mobilityNearHome: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de son domicile",
    },
  },
  young_mobilityNearRelative: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est disponible pour des missions aux alentours de l'adresse d'un de ses proches",
    },
  },
  young_mobilityNearRelativeName: {
    type: String,
    documentation: {
      description: "Nom du proche",
    },
  },
  young_mobilityNearRelativeAddress: {
    type: String,
    documentation: {
      description: "Adresse du proche",
    },
  },
  young_mobilityNearRelativeZip: {
    type: String,
    documentation: {
      description: "Code postal du proche",
    },
  },
  young_mobilityNearRelativeCity: {
    type: String,
    documentation: {
      description: "Ville du proche",
    },
  },
  young_mobilityTransport: {
    type: [String],
    documentation: {
      description: "Type de transport privilégié par le volontaire",
    },
  },
  young_mobilityTransportOther: {
    type: String,
    documentation: {
      description: "Autre type de transport privilégié par le volontaire",
    },
  },
  young_missionFormat: {
    type: String,
    enum: ["CONTINUOUS", "DISCONTINUOUS"],
    documentation: {
      description: "Format de mission privilégié",
    },
  },
  young_engaged: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le volontaire est engagé dans une structrue en dehors du SNU",
    },
  },
  young_engagedDescription: {
    type: String,
    documentation: {
      description: "Description de l'engagement du volontaire en dehors du SNU ",
    },
  },
  young_desiredLocation: {
    type: String,
    documentation: {
      description: "",
    },
  },

  // preparation militaire
  young_militaryPreparationFilesIdentity: {
    type: [String],
    default: [],
  },
  young_militaryPreparationFilesCensus: {
    type: [String],
    default: [],
  },
  young_militaryPreparationFilesAuthorization: {
    type: [String],
    default: [],
  },
  young_militaryPreparationFilesCertificate: {
    type: [String],
    default: [],
  },
  young_statusMilitaryPreparationFiles: {
    type: String,
    enum: ["VALIDATED", "WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "WAITING_UPLOAD"],
  },

  young_missionsInMail: {
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

  // TODO : clean interests
  young_defenseInterest: { type: String },
  young_defenseTypeInterest: { type: String },
  young_defenseDomainInterest: { type: String },
  young_defenseMotivationInterest: { type: String },
  young_securityInterest: { type: String },
  young_securityDomainInterest: { type: String },
  young_solidarityInterest: { type: String },
  young_healthInterest: { type: String },
  young_educationInterest: { type: String },
  young_cultureInterest: { type: String },
  young_sportInterest: { type: String },
  young_environmentInterest: { type: String },
  young_citizenshipInterest: { type: String },

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
  center_departmentCode: {
    type: String,
    documentation: {
      description: "Numéro du départment du centre",
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
  center_addressVerified: {
    type: String,
    documentation: {
      description: "Adresse validée",
    },
  },
  center_placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  center_placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
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
  excludes: ["/password", "/lastLoginAt", "/forgotPasswordResetToken", "/forgotPasswordResetExpires", "/invitationToken", "/invitationExpires", "/phase3Token"],
});
Schema.plugin(mongooseElastic(esClient, { ignore: ["historic"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
