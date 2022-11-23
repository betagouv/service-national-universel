import { frenchNationalityOptions, genderOptions } from "../../utils";

export const getObjectWithEmptyData = (fields) => {
  const object = {};
  fields.forEach((field) => {
    object[field] = "";
  });
  return object;
};

export const FRANCE = "France";

export const errorMessages = {
  addressVerified: "Merci de vérifier l'adresse",
  phone: "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX",
  zip: "Le code postal n'est pas valide",
  hasSpecialSituation: "Merci de choisir au moins une option.",
};

export const birthPlaceFields = ["birthCountry", "birthCity", "birthCityZip"];
export const addressFields = ["address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified"];
export const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
export const moreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

export const commonFields = [
  "frenchNationality",
  ...birthPlaceFields,
  ...addressFields,
  "gender",
  "phone",
  "situation",
  "livesInFrance",
  "handicap",
  "allergies",
  "ppsBeneficiary",
  "paiBeneficiary",
];

export const commonRequiredFields = [
  "frenchNationality",
  ...birthPlaceFields,
  "gender",
  "phone",
  "situation",
  "livesInFrance",
  "address",
  "zip",
  "city",
  "region",
  "department",
  "location",
  "handicap",
  "allergies",
  "ppsBeneficiary",
  "paiBeneficiary",
];

export const requiredFieldsForeigner = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
export const requiredMoreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

export const defaultState = {
  frenchNationality: "true",
  birthCountry: FRANCE,
  birthCityZip: "",
  birthCity: "",
  gender: genderOptions[0].value,
  phone: "",
  livesInFrance: frenchNationalityOptions[0].value,
  addressVerified: "false",
  address: "",
  zip: "",
  city: "",
  region: "",
  department: "",
  location: {},
  cityCode: "",
  foreignCountry: "",
  foreignAddress: "",
  foreignCity: "",
  foreignZip: "",
  hostFirstName: "",
  hostLastName: "",
  hostRelationship: "",
  situation: "",
  schooled: "",
  handicap: "false",
  allergies: "false",
  ppsBeneficiary: "false",
  paiBeneficiary: "false",
  specificAmenagment: "",
  specificAmenagmentType: "",
  reducedMobilityAccess: "",
  handicapInSameDepartment: "",
};
