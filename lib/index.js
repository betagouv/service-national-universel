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

const getResultLabel = (e) =>
  `${e.displayedResults * e.currentPage + 1}-${
    e.displayedResults * (e.currentPage + 1)
  } sur ${
    e.numberOfResults >= constants.ES_NO_LIMIT
      ? `+${constants.ES_NO_LIMIT}`
      : e.numberOfResults
  }`;

module.exports = {
  isEndOfInscriptionManagement2021,
  isInRuralArea,
  getFilterLabel,
  getResultLabel,
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
