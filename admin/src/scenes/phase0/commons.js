import countries from "i18n-iso-countries";
import { YOUNG_SITUATIONS } from "snu-lib";
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
];

export const countryOptions = Object.values(countriesList)
  .sort((a, b) => a.localeCompare(b))
  .map((countryName) => ({ value: countryName, label: countryName }));

export const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];
export const youngSchooledSituationOptions = [
  YOUNG_SITUATIONS.GENERAL_SCHOOL,
  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  YOUNG_SITUATIONS.APPRENTICESHIP,
];
