import { FEATURES_NAME, isFeatureEnabled, YOUNG_STATUS } from "snu-lib";
import { getCohort } from "./cohorts";
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

export function shouldForceRedirectToEmailValidation(user) {
  const cohort = getCohort(user.cohort);
  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);
  const shouldUserValidateEmail = user.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && new Date() < new Date(cohort.inscriptionModificationEndDate);
  const pathname = window.location.pathname;
  return isEmailValidationEnabled && shouldUserValidateEmail && pathname !== "/preinscription/email-validation";
}

export function shouldForceRedirectToReinscription(young) {
  return young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status);
}

export function shouldForceRedirectToInscription(young, isInscriptionModificationOpen = false) {
  if (window.location.pathname === "/changer-de-sejour") return false;
  return (
    [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status) ||
    (isInscriptionModificationOpen &&
      young.status === YOUNG_STATUS.WAITING_VALIDATION &&
      ((young.hasStartedReinscription && young.reinscriptionStep2023 !== "DONE") || (!young.hasStartedReinscription && young.inscriptionStep2023 !== "DONE")))
  );
}
