export * from "./date";
export * from "./constants";
export * from "./region-and-departments";

export const isInRuralArea = (v) => {
  if (!v.populationDensity) return null;
  return ["PEU DENSE", "TRES PEU DENSE"].includes(v.populationDensity)
    ? "true"
    : "false";
};

// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
export function isEndOfInscriptionManagement2021() {
  return new Date() > new Date(2021, 4, 6); // greater than 6 mai 2021 morning
}
