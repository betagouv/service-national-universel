import countries from "i18n-iso-countries";
import constants from "snu-lib/constants";
import translation from "snu-lib/translation";
import * as fr from "i18n-iso-countries/langs/fr.json";
countries.registerLocale(fr);
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

export const YOUNG_SCHOOLED_SITUATIONS = {
  GENERAL_SCHOOL: constants.YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: constants.YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: constants.YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: constants.YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: constants.YOUNG_SITUATIONS.APPRENTICESHIP,
};

export const YOUNG_ACTIVE_SITUATIONS = {
  EMPLOYEE: constants.YOUNG_SITUATIONS.EMPLOYEE,
  INDEPENDANT: constants.YOUNG_SITUATIONS.INDEPENDANT,
  SELF_EMPLOYED: constants.YOUNG_SITUATIONS.SELF_EMPLOYED,
  ADAPTED_COMPANY: constants.YOUNG_SITUATIONS.ADAPTED_COMPANY,
  POLE_EMPLOI: constants.YOUNG_SITUATIONS.POLE_EMPLOI,
  MISSION_LOCALE: constants.YOUNG_SITUATIONS.MISSION_LOCALE,
  CAP_EMPLOI: constants.YOUNG_SITUATIONS.CAP_EMPLOI,
  NOTHING: constants.YOUNG_SITUATIONS.NOTHING,
};

export const youngEmployedSituationOptions = [
  constants.YOUNG_SITUATIONS.EMPLOYEE,
  constants.YOUNG_SITUATIONS.INDEPENDANT,
  constants.YOUNG_SITUATIONS.SELF_EMPLOYED,
  constants.YOUNG_SITUATIONS.ADAPTED_COMPANY,
];

export const youngSchooledSituationOptions = Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((situation) => ({
  value: YOUNG_SCHOOLED_SITUATIONS[situation],
  label: translation.translate(situation),
}));

export const youngActiveSituationOptions = Object.keys(YOUNG_ACTIVE_SITUATIONS).map((situation) => ({
  value: YOUNG_ACTIVE_SITUATIONS[situation],
  label: translation.translate(situation),
}));
