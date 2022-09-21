const colors = require("./colors");
const date = require("./date");
const constants = require("./constants");
const file = require("./file");
const translation = require("./translation");
const regionAndDepartments = require("./region-and-departments");
const academy = require("./academy");
const roles = require("./roles");
const zammood = require("./zammood");
const {
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  COHESION_STAY_START,
} = require("./constants");
const isInRuralArea = (v) => {
  if (!v.populationDensity) return null;
  return ["PEU DENSE", "TRES PEU DENSE"].includes(v.populationDensity)
    ? "true"
    : "false";
};

// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
function isEndOfInscriptionManagement2021() {
  return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}

function inscriptionModificationOpenForYoungs(cohort) {
  switch (cohort) {
    case "2019":
    case "2020":
    case "2021":
      return false;
    case "2022":
      return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
    case "Février 2022":
      return new Date() < new Date(2022, 0, 10); // before 10 janvier 2022 morning
    case "Juin 2022":
      return new Date() < new Date(2022, 3, 27); // before 27 avril 2022 morning
    case "Juillet 2022":
      return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
    default:
      return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
  }
}

function inscriptionCreationOpenForYoungs(cohort, allowed = false) {
  if (allowed) return true;
  switch (cohort) {
    case "Février 2022":
      return new Date() < new Date(2022, 0, 10); // before 10 janvier 2022 morning
    case "Juin 2022":
      return new Date() < new Date(2022, 3, 25); // before 25 avril 2022 morning
    case "2022":
    case "Juillet 2022":
      return new Date() < new Date(2022, 4, 2); // before 2 mai 2022 morning
    default:
      return new Date() < new Date(2022, 4, 2); // before 2 mai 2022 morning
  }
}

const getFilterLabel = (
  selected,
  placeholder = "Choisissez un filtre",
  prelabel = ""
) => {
  if (Object.keys(selected).length === 0) return placeholder;
  const translator = (item) => {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (
      prelabel === "Dossier d’éligibilité aux Préparations Militaires"
    ) {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else {
      return translation.translate(item);
    }
  };
  const translated = Object.keys(selected).map((item) => {
    return translator(item);
  });
  let value = translated.join(", ");
  if (prelabel) value = prelabel + " : " + value;
  return value;
};

const getSelectedFilterLabel = (selected, prelabel) => {
  const translator = (item) => {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (
      prelabel === "Dossier d’éligibilité aux Préparations Militaires"
    ) {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else {
      return translation.translate(item);
    }
  };
  const translated = selected.map((item) => {
    return translator(item);
  });
  let value = translated.join(", ");
  if (prelabel) value = prelabel + " : " + value;
  return value;
};

const getResultLabel = (e, pageSize) =>
  `${pageSize * e.currentPage + 1}-${
    pageSize * e.currentPage + e.displayedResults
  } sur ${e.numberOfResults}`;

const getLabelWithdrawnReason = (value) =>
  constants.WITHRAWN_REASONS.find((e) => e.value === value)?.label || value;

function canUpdateYoungStatus({ body, current }) {
  if (!body || !current) return true;
  const allStatus = [
    "status",
    "statusPhase1",
    "statusPhase2",
    "statusPhase3",
    "statusMilitaryPreparationFiles",
    "statusPhase2Contract",
  ];
  if (!allStatus.some((s) => body[s] !== current[s])) return true;

  const youngStatus =
    body.status === "VALIDATED" && current.status !== "VALIDATED";
  const youngStatusPhase1 =
    body.statusPhase1 === "DONE" && current.statusPhase1 !== "DONE";
  const youngStatusPhase2 =
    body.statusPhase2 === "VALIDATED" && current.statusPhase2 !== "VALIDATED";
  const youngStatusPhase3 =
    body.statusPhase3 === "VALIDATED" && current.statusPhase3 !== "VALIDATED";
  const youngStatusMilitaryPrepFiles =
    body.statusMilitaryPreparationFiles === "VALIDATED" &&
    current.statusMilitaryPreparationFiles !== "VALIDATED";
  const youngStatusPhase2Contract =
    body.statusPhase2Contract === "VALIDATED" &&
    current.statusPhase2Contract !== "VALIDATED";

  const notAuthorized =
    youngStatus ||
    youngStatusPhase1 ||
    youngStatusPhase2 ||
    youngStatusPhase3 ||
    youngStatusMilitaryPrepFiles ||
    youngStatusPhase2Contract;

  return !notAuthorized;
}

const SESSIONPHASE1ID_CANCHANGESESSION = [
  "627cd8b873254d073af93147",
  "6274e6359ea0ba074acf6557",
];

const youngCanChangeSession = ({
  cohort,
  statusPhase1,
  status,
  sessionPhase1Id,
}) => {
  if (status === YOUNG_STATUS.WAITING_LIST) return true;
  if (
    [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE].includes(
      statusPhase1
    ) &&
    SESSIONPHASE1ID_CANCHANGESESSION.includes(sessionPhase1Id)
  ) {
    return true;
  }
  if (
    [
      YOUNG_STATUS_PHASE1.AFFECTED,
      YOUNG_STATUS_PHASE1.NOTDONE,
      YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
    ].includes(statusPhase1)
  ) {
    const now = Date.now();
    const limit = new Date(COHESION_STAY_START[cohort]);
    limit.setDate(limit.getDate() + 1);

    if (now < limit) return true;
  }
  return false;
};

const formatPhoneNumberFR = (tel) => {
  if (!tel) return "";
  const regex = /^((?:(?:\+|00)33|0)\s*[1-9])((?:[\s.-]*\d{2}){4})$/;
  const global = tel.match(regex);
  if (global?.length !== 3) {
    return tel;
  }
  const rest = global[2].match(/.{1,2}/g);
  const formatted = `${global[1]} ${rest.join(" ")}`;
  return formatted;
};

const youngExportFields = [
  {
    id: "identity",
    title: "Identité du volontaire",
    desc: ["Prénom", "Nom", "Sexe", "Cohorte", "Cohorte d'origine"],
    fields: ["firstName", "lastName", "gender", "cohort", "originalCohort"],
  },
  {
    id: "contact",
    title: "Contact du volontaire",
    desc: ["Email", "Téléphone"],
    fields: ["email", "phone"],
  },
  {
    id: "birth",
    title: "Date et lieu de naissance du volontaire",
    desc: [
      "Date de naissance",
      "Pays de naissance",
      "Ville de naissance",
      "Code postal de naissance",
    ],
    fields: ["birthdateAt", "birthCountry", "birthCity", "birthCityZip"],
  },
  {
    id: "address",
    title: "Lieu de résidence du volontaire",
    desc: [
      "Adresse postale",
      "Code postal",
      "Ville",
      "Pays",
      "Nom de l'hébergeur",
      "Prénom de l'hébergeur",
      "Lien avec l'hébergeur",
      "Adresse - étranger",
      "Code postal - étranger",
      "Ville - étranger",
      "Pays - étranger",
    ],
    fields: [
      "address",
      "zip",
      "city",
      "country",
      "hostLastName",
      "hostFirstName",
      "hostRelationship",
      "foreignAddress",
      "foreignZip",
      "foreignCity",
      "foreignCountry",
    ],
  },
  {
    id: "location",
    title: "Localisation du volontaire",
    desc: ["Département", "Académie", "Région"],
    fields: ["department", "academy", "region"],
  },
  {
    id: "schoolSituation",
    title: "Situation scolaire",
    desc: [
      "Niveau",
      "Type d'établissement",
      "Nom de l'établissement",
      "Code postal de l'établissement",
      "Ville de l'établissement",
      "Département de l'établissement",
      "UAI de l'établissement",
    ],
    fields: [
      "situation",
      "grade",
      "esSchool.type",
      "schoolType",
      "esSchool.fullName",
      "schoolName",
      "esSchool.postcode",
      "schoolZip",
      "esSchool.city",
      "schoolCity",
      "esSchool.department",
      "schoolDepartment",
      "esSchool.uai",
    ],
  },
  {
    id: "situation",
    title: "Situation particulière",
    desc: [
      "Quartier Prioritaire de la ville",
      "Zone Rurale",
      "Handicap",
      "PPS",
      "PAI",
      "Aménagement spécifique",
      "Nature de l'aménagement spécifique",
      "Aménagement pour mobilité réduite",
      "Besoin d'être affecté(e) dans le département de résidence",
      "Allergies ou intolérances alimentaires",
      "Activité de haut-niveau",
      "Nature de l'activité de haut-niveau",
      "Activités de haut niveau nécessitant d'être affecté dans le département de résidence",
      "Document activité de haut-niveau",
      "Structure médico-sociale",
      "Nom de la structure médico-sociale",
      "Adresse de la structure médico-sociale",
      "Code postal de la structure médico-sociale",
      "Ville de la structure médico-sociale",
    ],
    fields: [
      "qpv",
      "populationDensity",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "specificAmenagment",
      "specificAmenagmentType",
      "reducedMobilityAccess",
      "handicapInSameDepartment",
      "allergies",
      "highSkilledActivity",
      "highSkilledActivityType",
      "highSkilledActivityInSameDepartment",
      "highSkilledActivityProofFiles",
      "medicosocialStructure",
      "medicosocialStructureName",
      "medicosocialStructureAddress",
      "medicosocialStructureZip",
      "medicosocialStructureCity",
    ],
  },
  {
    id: "representative1",
    title: "Représentant légal 1",
    desc: [
      "Statut",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Adresse",
      "Code postal",
      "Ville",
      "Département et région du représentant légal",
    ],
    fields: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent1Address",
      "parent1Zip",
      "parent1City",
      "parent1Department",
      "parent1Region",
    ],
  },
  {
    id: "representative2",
    title: "Représentant légal 2",
    desc: [
      "Statut",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Adresse",
      "Code postal",
      "Ville",
      "Département et région du représentant légal",
    ],
    fields: [
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
      "parent2Address",
      "parent2Zip",
      "parent2City",
      "parent2Department",
      "parent2Region",
    ],
  },
  {
    id: "consent",
    title: "Consentement",
    desc: ["Consentement des représentants légaux."],
    fields: ["parentConsentment"],
  },
  {
    id: "status",
    title: "Statut",
    desc: [
      "Statut général",
      "Statut phase 1",
      "Statut phase 2",
      "Statut phase 3",
      "Date du dernier statut",
    ],
    fields: [
      "status",
      "phase",
      "statusPhase1",
      "statusPhase2",
      "statusPhase3",
      "lastStatusAt",
    ],
  },
  {
    id: "phase1Affectation",
    title: "Phase 1 - Affectation ",
    desc: ["ID", "Code", "Nom", "Ville", "Département et région du centre"],
    fields: [],
  },
  {
    id: "phase1Transport",
    title: "Phase 1 - Transport",
    desc: [
      "Autonomie",
      "Numéro de bus",
      "Point de rassemblement",
      "Dates d'aller et de retour",
    ],
    fields: [],
  },
  {
    id: "phase1DocumentStatus",
    title: "Phase 1 - Statut des documents",
    desc: [
      "Droit à l'image",
      "Autotest PCR",
      "Règlement intérieur",
      "Fiche sanitaire",
    ],
    fields: [
      "imageRightFilesStatus",
      "autoTestPCRFilesStatus",
      "rulesYoung",
      "cohesionStayMedicalFileReceived",
    ],
  },
  {
    id: "phase1DocumentAgreement",
    title: "Phase 1 - Accords",
    desc: ["Accords pour droit à l'image et autotests PCR."],
    fields: ["imageRight", "autoTestPCR"],
  },
  {
    id: "phase1Attendance",
    title: "Phase 1 - Présence",
    desc: [
      "Présence à l'arrivé",
      "Présence à la JDM",
      "Date de départ",
      "Motif de départ",
    ],
    fields: [
      "cohesionStayPresence",
      "presenceJDM",
      "departSejourAt",
      "departSejourMotif",
    ],
  },
  {
    id: "phase2",
    title: "Phase 2",
    desc: [
      "Domaines MIG 1, MIG 2 et MIG 3",
      "Projet professionnel",
      "Période privilégiée",
      "Choix de périodes",
      "Mobilité",
      "Mobilité autour d'un proche",
      "Information du proche",
      "Mode de transport",
      "Format de mission",
      "Engagement hors SNU",
      "Souhait MIG",
    ],
    fields: [
      "domains",
      "professionnalProject",
      "professionnalProjectPrecision",
      "period",
      "periodRanking",
      "mobilityNearSchool",
      "mobilityNearHome",
      "mobilityNearRelative",
      "mobilityNearRelativeName",
      "mobilityNearRelativeAddress",
      "mobilityNearRelativeZip",
      "mobilityNearRelativeCity",
      "mobilityTransport",
      "missionFormat",
      "engaged",
      "engagedDescription",
      "desiredLocation",
    ],
  },
  {
    id: "accountDetails",
    title: "Compte",
    desc: ["Dates de création, d'édition et de dernière connexion"],
    fields: ["createdAt", "updatedAt", "lastLoginAt"],
  },
  {
    id: "desistement",
    title: "Désistement",
    desc: ["Raison du désistement", "Message de désistement"],
    fields: ["withdrawnReason", "withdrawnMessage"],
  },
];

module.exports = {
  isEndOfInscriptionManagement2021,
  inscriptionModificationOpenForYoungs,
  inscriptionCreationOpenForYoungs,
  isInRuralArea,
  getFilterLabel,
  getSelectedFilterLabel,
  getResultLabel,
  getLabelWithdrawnReason,
  canUpdateYoungStatus,
  youngCanChangeSession,
  formatPhoneNumberFR,
  youngExportFields,
  ...colors,
  ...regionAndDepartments,
  ...academy,
  ...date,
  ...constants,
  ...file,
  ...roles,
  ...zammood,
  ...translation,
};
