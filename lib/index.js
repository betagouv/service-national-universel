const colors = require("./colors");
const date = require("./date");
const constants = require("./constants");
const file = require("./file");
const regionAndDepartments = require("./region-and-departments");

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

module.exports = {
  isEndOfInscriptionManagement2021,
  isInRuralArea,
  ...colors,
  ...regionAndDepartments,
  ...date,
  ...constants,
  ...file,
};
