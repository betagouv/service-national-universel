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
  switch(cohort){
    case "2019":
    case "2020":
    case "2021":
      return false
    case "2022":
      return true;
    case "Février 2022":
      return new Date() < new Date(2022, 0, 7); // before 10 janvier 2022 morning
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
  } sur ${
    e.numberOfResults >= constants.ES_NO_LIMIT
      ? `+${constants.ES_NO_LIMIT}`
      : e.numberOfResults
  }`;

const getLabelWithdrawnReason = (value) => constants.WITHRAWN_REASONS.find(e=>e.value===value)?.label || value;

module.exports = {
  isEndOfInscriptionManagement2021,
  inscriptionCreationAndModificationOpenForYoungs,
  isInRuralArea,
  getFilterLabel,
  getResultLabel,
  getLabelWithdrawnReason,
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
