import * as constants from "./constants";
import { translate } from "./translation";

export * from "./colors";
export * from "./date";
export * from "./constants";
export * from "./file";
export * from "./translation";
export * from "./region-and-departments";
export * from "./roles";
export * from "./zammad";

export const isInRuralArea = (v) => {
  if (!v.populationDensity) return null;
  return ["PEU DENSE", "TRES PEU DENSE"].includes(v.populationDensity)
    ? "true"
    : "false";
};

// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
export function isEndOfInscriptionManagement2021() {
  return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}

export const getFilterLabel = (
  selected,
  placeholder = "Choisissez un filtre"
) => {
  if (Object.keys(selected).length === 0) return placeholder;
  const translated = Object.keys(selected).map((item) => {
    return translate(item);
  });
  return translated.join(", ");
};

export const getResultLabel = (e) =>
  `${e.displayedResults * e.currentPage + 1}-${
    e.displayedResults * (e.currentPage + 1)
  } sur ${
    e.numberOfResults >= constants.ES_NO_LIMIT
      ? `+${constants.ES_NO_LIMIT}`
      : e.numberOfResults
  }`;
