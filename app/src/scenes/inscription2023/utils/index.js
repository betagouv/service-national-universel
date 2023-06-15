import constants from "snu-lib/constants";
import translation from "snu-lib/translation";
import countries from "i18n-iso-countries";
import * as fr from "i18n-iso-countries/langs/fr.json";
countries.registerLocale(fr);
const countriesList = countries.getNames("fr", { select: "official" });

const YOUNG_SCHOOLED_SITUATIONS = {
  GENERAL_SCHOOL: constants.YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: constants.YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: constants.YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: constants.YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: constants.YOUNG_SITUATIONS.APPRENTICESHIP,
};

const YOUNG_ACTIVE_SITUATIONS = {
  EMPLOYEE: constants.YOUNG_SITUATIONS.EMPLOYEE,
  INDEPENDANT: constants.YOUNG_SITUATIONS.INDEPENDANT,
  SELF_EMPLOYED: constants.YOUNG_SITUATIONS.SELF_EMPLOYED,
  ADAPTED_COMPANY: constants.YOUNG_SITUATIONS.ADAPTED_COMPANY,
  POLE_EMPLOI: constants.YOUNG_SITUATIONS.POLE_EMPLOI,
  MISSION_LOCALE: constants.YOUNG_SITUATIONS.MISSION_LOCALE,
  CAP_EMPLOI: constants.YOUNG_SITUATIONS.CAP_EMPLOI,
  NOTHING: constants.YOUNG_SITUATIONS.NOTHING,
};

export const youngSchooledSituationOptions = Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((situation) => ({
  value: YOUNG_SCHOOLED_SITUATIONS[situation],
  label: translation.translate(situation),
}));

export const youngActiveSituationOptions = Object.keys(YOUNG_ACTIVE_SITUATIONS).map((situation) => ({
  value: YOUNG_ACTIVE_SITUATIONS[situation],
  label: translation.translate(situation),
}));

export const foreignCountryOptions = Object.values(countriesList)
  .sort((a, b) => a.localeCompare(b))
  .filter((countryName) => countryName !== "France")
  .map((countryName) => ({ value: countryName, label: countryName }));

export const hostRelationshipOptions = [
  { label: "Parent", value: "Parent" },
  { label: "Frère/Soeur", value: "Frere/Soeur" },
  { label: "Grand-parent", value: "Grand-parent" },
  { label: "Oncle/Tante", value: "Oncle/Tante" },
  { label: "Ami de la famille", value: "Ami de la famille" },
  { label: "Autre", value: "Autre" },
];

export const inFranceOrAbroadOptions = [
  { value: "true", label: "En France (Métropolitaine ou Outre-mer)" },
  { value: "false", label: "À l'étranger" },
];

export const genderOptions = [
  { value: "female", label: "Femme" },
  { value: "male", label: "Homme" },
];

export const booleanOptions = [
  { value: "true", label: "Oui" },
  { value: "false", label: "Non" },
];

export const ID = {
  cniNew: {
    category: "cniNew",
    title: "Carte Nationale d'Identité",
    subtitle: "Nouveau format (après août 2021)",
    imgFront: "cniNewFront.jpg",
    imgBack: "cniNewBack.jpg",
    imgDate: "cniNewDate.jpg",
  },
  cniOld: {
    category: "cniOld",
    title: "Carte Nationale d'Identité",
    subtitle: "Ancien format",
    imgFront: "cniOldFront.jpg",
    imgBack: "cniOldBack.jpg",
    imgDate: "cniOldDate.jpg",
  },
  passport: {
    category: "passport",
    title: "Passeport",
    imgFront: "passport.jpg",
    imgDate: "passportDate.jpg",
  },
};
