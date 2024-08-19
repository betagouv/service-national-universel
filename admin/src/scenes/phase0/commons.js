import countries from "i18n-iso-countries";
import { translate, YOUNG_SITUATIONS } from "snu-lib";
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
  GENERAL_SCHOOL: YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: YOUNG_SITUATIONS.APPRENTICESHIP,
};

export const YOUNG_ACTIVE_SITUATIONS = {
  EMPLOYEE: YOUNG_SITUATIONS.EMPLOYEE,
  INDEPENDANT: YOUNG_SITUATIONS.INDEPENDANT,
  SELF_EMPLOYED: YOUNG_SITUATIONS.SELF_EMPLOYED,
  ADAPTED_COMPANY: YOUNG_SITUATIONS.ADAPTED_COMPANY,
  POLE_EMPLOI: YOUNG_SITUATIONS.POLE_EMPLOI,
  MISSION_LOCALE: YOUNG_SITUATIONS.MISSION_LOCALE,
  CAP_EMPLOI: YOUNG_SITUATIONS.CAP_EMPLOI,
  NOTHING: YOUNG_SITUATIONS.NOTHING,
};

export const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];

export const youngSchooledSituationOptions = Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((situation) => ({
  value: YOUNG_SCHOOLED_SITUATIONS[situation],
  label: translate(situation),
}));

export const youngActiveSituationOptions = Object.keys(YOUNG_ACTIVE_SITUATIONS).map((situation) => ({
  value: YOUNG_ACTIVE_SITUATIONS[situation],
  label: translate(situation),
}));
