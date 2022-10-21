const colors = require("./colors");
const date = require("./date");
const constants = require("./constants");
const file = require("./file");
const translation = require("./translation");
const regionAndDepartments = require("./region-and-departments");
const academy = require("./academy");
const roles = require("./roles");
const zammood = require("./zammood");
const excelExports = require("./excelExports");
const sessions = require("./sessions");
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
    case "Février 2023 - C":
      return new Date() < new Date(2023, 0, 4); // before 4 janvier 2023 morning
    case "Avril 2023 - A":
      return new Date() < new Date(2023, 1, 7); // before 7 fevrier 2023 morning
    case "Avril 2023 - B":
      return new Date() < new Date(2023, 1, 21); // before 7 fevrier 2023 morning
    case "Juin 2023":
      return new Date() < new Date(2023, 3, 19); // before 19 avril 2023 morning
    case "Juillet 2023":
      return new Date() < new Date(2023, 4, 11); // before 11 mai 2023 morning
    default:
      return new Date() < new Date(2023, 4, 11); // before 11 mai 2023 morning
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
      return new Date() < new Date(2023, 4, 11); // before 11 mai 2023 morning
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
    } else if (prelabel === "Source") {
      return translation.translateSource(item);
    } else {
      return translation.translate(item);
    }
  };
  let value = "";
  if (typeof selected === "object") {
    translated = selected.map((item) => {
      return translator(item);
    });
    value = translated.join(", ");
  } else value = selected;
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
    body.status === "VALIDATED" &&
    !["REINSCRIPTION", "VALIDATED"].includes(current.status);
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
  ...colors,
  ...regionAndDepartments,
  ...academy,
  ...date,
  ...constants,
  ...file,
  ...roles,
  ...zammood,
  ...translation,
  ...excelExports,
  ...sessions,
};
