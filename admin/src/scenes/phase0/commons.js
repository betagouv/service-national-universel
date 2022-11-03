import countries from "i18n-iso-countries";
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
const countriesList = countries.getNames("fr", { select: "official" });

export const SPECIFIC_SITUATIONS_KEY = [
  "qpv",
  "handicap",
  "ppsBeneficiary",
  "paiBeneficiary",
  "specificAmenagment",
  "reducedMobilityAccess",
  "handicapInSameDepartment",
  "allergies",
  "highSkilledActivity",
  "highSkilledActivityInSameDepartment",
];

export const countryOptions = Object.values(countriesList)
  .sort((a, b) => a.localeCompare(b))
  .map((countryName) => ({ value: countryName, label: countryName }));
