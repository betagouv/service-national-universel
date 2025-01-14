import { FEATURES_NAME, isFeatureEnabled, YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";
import { environment } from "@/config";

export const INSCRIPTION_STEPS = {
  EMAIL_WAITING_VALIDATION: "EMAIL_WAITING_VALIDATION",
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
    redirect: "/inscription/correction/profil",
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
    redirect: "/inscription/correction/eligibilite",
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
    redirect: "/inscription/correction/representants",
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
      "psc1Info",
    ],
    redirect: "/inscription/correction/coordonnee",
    step: "coordonnee",
  },
  {
    field: ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"],
    redirect: "/inscription/correction/documents",
    step: "documents",
  },
];

const WAITING_CORRECTION_LINK_CLE = [
  {
    field: ["firstName", "lastName", "frenchNationality", "phone", "email", "birthdateAt", "grade"],
    redirect: "/inscription/correction/profil",
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
    redirect: "/inscription/correction/representants",
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
      "psc1Info",
    ],
    redirect: "/inscription/correction/coordonnee",
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
    if (["SENT", "REMINDED"].includes(curr.status) && keyList?.field.includes(curr.field)) {
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

export function shouldForceRedirectToEmailValidation(user, cohort) {
  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);
  const shouldUserValidateEmail = user?.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && new Date() < new Date(cohort?.inscriptionModificationEndDate);
  const pathname = window.location.pathname;
  return isEmailValidationEnabled && shouldUserValidateEmail && pathname !== "/preinscription/email-validation";
}

export function shouldForceRedirectToReinscription(young) {
  return young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status);
}

export function shouldRedirectToReinscription(young) {
  if ([YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN].includes(young.status)) {
    return false;
  }
  return young.cohort === "à venir";
}

export function shouldForceRedirectToInscription(young, isInscriptionModificationOpen = false) {
  if (window.location.pathname.includes("/changer-de-sejour")) return false;
  if (young.cohort === "à venir") return false;
  return (
    [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status) ||
    (isInscriptionModificationOpen &&
      young.status === YOUNG_STATUS.WAITING_VALIDATION &&
      ((young.hasStartedReinscription && young.reinscriptionStep2023 !== "DONE") || (!young.hasStartedReinscription && young.inscriptionStep2023 !== "DONE")))
  );
}
