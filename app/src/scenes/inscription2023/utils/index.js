import { translate, YOUNG_SITUATIONS } from "snu-lib";
import countries from "i18n-iso-countries";
import * as fr from "i18n-iso-countries/langs/fr.json";
import cniNewBack from "../../../assets/IDProof/cniNewBack.jpg";
import cniNewDate from "../../../assets/IDProof/cniNewDate.jpg";
import cniNewFront from "../../../assets/IDProof/cniNewFront.jpg";
import cniOldBack from "../../../assets/IDProof/cniOldBack.jpg";
import cniOldDate from "../../../assets/IDProof/cniOldDate.jpg";
import cniOldFront from "../../../assets/IDProof/cniOldFront.jpg";
import passport from "../../../assets/IDProof/passport.jpg";
import passportDate from "../../../assets/IDProof/passportDate.jpg";
import API from "@/services/api";
import { capture } from "@/sentry";
import dayjs from "dayjs";

countries.registerLocale(fr);
const countriesList = countries.getNames("fr", { select: "official" });

const YOUNG_SCHOOLED_SITUATIONS = {
  GENERAL_SCHOOL: YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: YOUNG_SITUATIONS.APPRENTICESHIP,
};

const YOUNG_ACTIVE_SITUATIONS = {
  EMPLOYEE: YOUNG_SITUATIONS.EMPLOYEE,
  INDEPENDANT: YOUNG_SITUATIONS.INDEPENDANT,
  SELF_EMPLOYED: YOUNG_SITUATIONS.SELF_EMPLOYED,
  ADAPTED_COMPANY: YOUNG_SITUATIONS.ADAPTED_COMPANY,
  POLE_EMPLOI: YOUNG_SITUATIONS.POLE_EMPLOI,
  MISSION_LOCALE: YOUNG_SITUATIONS.MISSION_LOCALE,
  CAP_EMPLOI: YOUNG_SITUATIONS.CAP_EMPLOI,
  NOTHING: YOUNG_SITUATIONS.NOTHING,
};

export const youngSchooledSituationOptions = Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((situation) => ({
  value: YOUNG_SCHOOLED_SITUATIONS[situation],
  label: translate(situation),
}));

export const youngActiveSituationOptions = Object.keys(YOUNG_ACTIVE_SITUATIONS).map((situation) => ({
  value: YOUNG_ACTIVE_SITUATIONS[situation],
  label: translate(situation),
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
    imgFront: cniNewFront,
    imgBack: cniNewBack,
    imgDate: cniNewDate,
  },
  cniOld: {
    category: "cniOld",
    title: "Carte Nationale d'Identité",
    subtitle: "Ancien format",
    imgFront: cniOldFront,
    imgBack: cniOldBack,
    imgDate: cniOldDate,
  },
  passport: {
    category: "passport",
    title: "Passeport",
    imgFront: passport,
    imgDate: passportDate,
  },
};

export async function getCities(query) {
  try {
    const { responses } = await API.post(`/elasticsearch/schoolramses/public/search?searchCity=${encodeURIComponent(query)}&aggsByCitiesAndDepartments=true`);
    const cities = responses[0].aggregations.cities.buckets;
    return cities.map((e) => ({ label: e.key[0] + " - " + e.key[1], value: e.key })) ?? [];
  } catch (e) {
    capture(e);
    return [];
  }
}

export async function getSchools(city) {
  try {
    const { responses } = await API.post("/elasticsearch/schoolramses/public/search", {
      filters: { country: ["FRANCE"], city: [city.value[0]], departmentName: [city.value[1]] },
    });
    const schools = responses[0].hits.hits.map((e) => new Object({ ...e._source, ...{ id: e._id } }));
    return schools;
  } catch (e) {
    capture(e);
  }
}

export function validateBirthDate(date) {
  const d = dayjs(date);
  if (!d.isValid()) return false;
  if (d.isBefore(dayjs(new Date(2000, 0, 1)))) return false;
  if (d.isAfter(dayjs())) return false;
  return true;
}
