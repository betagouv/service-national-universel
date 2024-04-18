import { YOUNG_SOURCE } from "snu-lib";

export const INSCRIPTION_STEPS = {
  COORDONNEES: "COORDONNEES",
  CONSENTEMENTS: "CONSENTEMENTS",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  UPLOAD: "UPLOAD",
  CONFIRM: "CONFIRM",
  WAITING_CONSENT: "WAITING_CONSENT",
  DONE: "DONE",
};

export const PREINSCRIPTION_STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  INELIGIBLE: "INELIGIBLE",
  SEJOUR: "SEJOUR",
  PROFIL: "PROFIL",
  CONFIRM: "CONFIRM",
  NO_SEJOUR: "NO_SEJOUR",
};

export const REINSCRIPTION_STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  SEJOUR: "SEJOUR",
  CONFIRM: "CONFIRM",
  NO_SEJOUR: "NO_SEJOUR",
};

export const CORRECTION_STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  SEJOUR: "SEJOUR",
  PROFIL: "PROFIL",
  COORDONNEES: "COORDONNEES",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  UPLOAD: "UPLOAD",
};

export const INSCRIPTION_STEPS_LIST = [
  { name: INSCRIPTION_STEPS.COORDONNEES, url: "coordonnee" },
  { name: INSCRIPTION_STEPS.CONSENTEMENTS, url: "consentement" },
  { name: INSCRIPTION_STEPS.REPRESENTANTS, url: "representants" },
  { name: INSCRIPTION_STEPS.DOCUMENTS, url: "documents", allowNext: true },
  { name: INSCRIPTION_STEPS.UPLOAD, url: "televersement" },
  { name: INSCRIPTION_STEPS.CONFIRM, url: "confirm" },
  { name: INSCRIPTION_STEPS.WAITING_CONSENT, url: "done" },
  { name: INSCRIPTION_STEPS.DONE, url: "done" },
];

export const PREINSCRIPTION_STEPS_LIST = [
  { name: PREINSCRIPTION_STEPS.ELIGIBILITE, url: "eligibilite" },
  { name: PREINSCRIPTION_STEPS.INELIGIBLE, url: "noneligible" },
  { name: PREINSCRIPTION_STEPS.SEJOUR, url: "sejour" },
  { name: PREINSCRIPTION_STEPS.PROFIL, url: "profil" },
  { name: PREINSCRIPTION_STEPS.CONFIRM, url: "confirm" },
  { name: PREINSCRIPTION_STEPS.NO_SEJOUR, url: "no_sejour" },
];

export const REINSCRIPTION_STEPS_LIST = [
  { name: REINSCRIPTION_STEPS.ELIGIBILITE, url: "eligibilite" },
  { name: REINSCRIPTION_STEPS.SEJOUR, url: "sejour" },
  { name: REINSCRIPTION_STEPS.CONFIRM, url: "confirm" },
  { name: REINSCRIPTION_STEPS.NO_SEJOUR, url: "no_sejour" },
];

export const CORRECTION_STEPS_LIST = [
  { name: CORRECTION_STEPS.ELIGIBILITE, url: "eligibilite" },
  { name: CORRECTION_STEPS.PROFIL, url: "profil" },
  { name: CORRECTION_STEPS.COORDONNEES, url: "coordonnee" },
  { name: CORRECTION_STEPS.REPRESENTANTS, url: "representants" },
  { name: CORRECTION_STEPS.DOCUMENTS, url: "documents", allowNext: true },
  { name: CORRECTION_STEPS.UPLOAD, url: "televersement" },
];

export const getStepFromUrlParam = (param, STEP_LIST, withDefault) => {
  const step = STEP_LIST.find(({ url }) => url === param)?.name;
  return withDefault ? step || STEP_LIST[0].name : step;
};

export const getStepUrl = (name, STEP_LIST) => {
  return STEP_LIST.find((step) => step.name === name)?.url;
};

const WAITING_CORRECTION_LINK = [
  {
    field: ["firstName", "lastName", "phone", "email"],
    redirect: "/inscription2023/correction/profil",
    step: "profil",
  },
  {
    field: [
      "birthdateAt",
      "schooled",
      "grade",
      "schoolName",
      "schoolType",
      "schoolAddress",
      "schoolZip",
      "schoolCity",
      "schoolDepartment",
      "schoolRegion",
      "schoolCountry",
      "schoolId",
      "zip",
    ],
    redirect: "/inscription2023/correction/eligibilite",
    step: "eligibilite",
  },
  {
    field: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent2",
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
    ],
    redirect: "/inscription2023/correction/representants",
    step: "representants",
  },
  {
    field: [
      "gender",
      "frenchNationality",
      "birthCountry",
      "birthCity",
      "birthCityZip",
      "situation",
      "livesInFrance",
      "addressVerified",
      "country",
      "city",
      "zip",
      "address",
      "location",
      "department",
      "region",
      "cityCode",
      "foreignCountry",
      "foreignCity",
      "foreignZip",
      "foreignAddress",
      "hostLastName",
      "hostFirstName",
      "hostRelationship",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "allergies",
      "moreInformation",
      "specificAmenagment",
      "specificAmenagmentType",
      "reducedMobilityAccess",
      "handicapInSameDepartment",
    ],
    redirect: "/inscription2023/correction/coordonnee",
    step: "coordonnee",
  },
  {
    field: ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"],
    redirect: "/inscription2023/correction/documents",
    step: "documents",
  },
];

const WAITING_CORRECTION_LINK_CLE = [
  {
    field: ["firstName", "lastName", "frenchNationality", "phone", "email", "birthdateAt", "grade"],
    redirect: "/inscription2023/correction/profil",
    step: "profil",
  },
  {
    field: [
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent1Phone",
      "parent2",
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "parent2Phone",
    ],
    redirect: "/inscription2023/correction/representants",
    step: "representants",
  },
  {
    field: [
      "gender",
      "birthCountry",
      "birthCity",
      "birthCityZip",
      "situation",
      "livesInFrance",
      "addressVerified",
      "country",
      "city",
      "zip",
      "address",
      "location",
      "department",
      "region",
      "cityCode",
      "foreignCountry",
      "foreignCity",
      "foreignZip",
      "foreignAddress",
      "hostLastName",
      "hostFirstName",
      "hostRelationship",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "allergies",
      "moreInformation",
      "specificAmenagment",
      "specificAmenagmentType",
      "reducedMobilityAccess",
      "handicapInSameDepartment",
    ],
    redirect: "/inscription2023/correction/coordonnee",
    step: "coordonnee",
  },
];

const getCorrectionLink = (young) => {
  return young.source === YOUNG_SOURCE.CLE ? WAITING_CORRECTION_LINK_CLE : WAITING_CORRECTION_LINK;
};

export const getCorrectionByStep = (young, step) => {
  const correctionLink = getCorrectionLink(young);
  const keyList = correctionLink.find((link) => link.step === step);
  const corrections = young?.correctionRequests.reduce((acc, curr) => {
    if (["SENT", "REMINDED"].includes(curr.status) && keyList?.field.includes(curr.field) && curr.cohort === young.cohort) {
      acc[curr.field] = curr.message;
    }
    return acc;
  }, {});
  return corrections;
};

export const getCorrectionsForStepUpload = (young) => {
  return young.correctionRequests
    ?.filter((e) => e.cohort === young.cohort)
    ?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"].includes(e.field));
};

export const redirectToCorrection = (young, field) => {
  const correctionLink = getCorrectionLink(young);
  const correction = correctionLink.find((correction) => correction.field.includes(field));
  return correction ? correction.redirect : "/";
};
