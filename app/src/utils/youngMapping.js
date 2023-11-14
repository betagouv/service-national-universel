export const youngMapping2 = {
  hts: "volontaire",
  cle: "élève",
};
export const documentRequiredForParcours = "hts";

export const parcoursConfig = {
  hts: {
    wording: "volontaire",
    showDocument: true,
  },
  cle: {
    wording: "élève",
    showDocument: false,
  },
};

export const youngMapping = Object.fromEntries(Object.entries(parcoursConfig).map(([key, value]) => [key, value.wording]));
