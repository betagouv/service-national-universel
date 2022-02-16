const colors = require("./colors");
const date = require("./date");
const constants = require("./constants");
const file = require("./file");
const translation = require("./translation");
const regionAndDepartments = require("./region-and-departments");
const academy = require("./academy");
const roles = require("./roles");
const zammad = require("./zammad");

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

function inscriptionCreationAndModificationOpenForYoungs(cohort) {
  switch (cohort) {
    case "2019":
    case "2020":
    case "2021":
      return false;
    case "2022":
      return true;
    case "Février 2022":
      return new Date() < new Date(2022, 0, 10); // before 10 janvier 2022 morning
    case "Juin 2022":
    case "Juillet 2022":
      return true;
    default:
      return true;
  }
}

const getFilterLabel = (
  selected,
  placeholder = "Choisissez un filtre",
  prelabel = ""
) => {
  if (Object.keys(selected).length === 0) return placeholder;
  const translated = Object.keys(selected).map((item) => {
    return translation.translate(item);
  });
  let value = translated.join(", ");
  if (prelabel) value = prelabel + " - " + value;
  return value;
};

const getResultLabel = (e, pageSize) =>
  `${pageSize * e.currentPage + 1}-${
    pageSize * e.currentPage + e.displayedResults
  } sur ${e.numberOfResults}`;

const getLabelWithdrawnReason = (value) =>
  constants.WITHRAWN_REASONS.find((e) => e.value === value)?.label || value;

function canUpdateStatus(newYoung, oldYoung) {
  const allStatus = ["status", "statusPhase1", "statusPhase2", "statusPhase3", "statusMilitaryPreparationFiles", "statusPhase2Contract", "gender"];
  if (!allStatus.filter((s) => newYoung[s] !== oldYoung[s]).length) return true;

  const youngStatus = newYoung.status === "VALIDATED" && oldYoung.status !== "VALIDATED";
  const youngStatusPhase1 = newYoung.statusPhase1 === "DONE" && oldYoung.statusPhase1 !== "DONE";
  const youngStatusPhase2 = newYoung.statusPhase2 === "VALIDATED" && oldYoung.statusPhase2 !== "VALIDATED";
  const youngStatusPhase3 = newYoung.statusPhase3 === "VALIDATED" && oldYoung.statusPhase3 !== "VALIDATED";
  const youngStatusMilitaryPrepFiles = newYoung.statusMilitaryPreparationFiles === "VALIDATED" && oldYoung.statusMilitaryPreparationFiles !== "VALIDATED";
  const youngStatusPhase2Contract = newYoung.statusPhase2Contract === "VALIDATED" && oldYoung.statusPhase2Contract !== "VALIDATED";
  const youngGender = newYoung.gender === "female" && oldYoung.gender !== "female";

  const authorized = youngStatus || youngStatusPhase1 || youngStatusPhase2 || youngStatusPhase3 || youngStatusMilitaryPrepFiles || youngStatusPhase2Contract || youngGender;

  return !authorized;
}

module.exports = {
  isEndOfInscriptionManagement2021,
  inscriptionCreationAndModificationOpenForYoungs,
  isInRuralArea,
  getFilterLabel,
  getResultLabel,
  getLabelWithdrawnReason,
  canUpdateStatus,
  ...colors,
  ...regionAndDepartments,
  ...academy,
  ...date,
  ...constants,
  ...file,
  ...roles,
  ...zammad,
  ...translation,
};
