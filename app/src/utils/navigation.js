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
  DONE: "DONE",
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
  { name: PREINSCRIPTION_STEPS.DONE, url: "done" },
];

export const getStepFromUrlParam = (param, STEP_LIST, withDefault) => {
  const step = STEP_LIST.find(({ url }) => url === param)?.name;
  return withDefault ? step || STEP_LIST[0].name : step;
};

export const getStepUrl = (name, STEP_LIST) => {
  return STEP_LIST.find((step) => step.name === name)?.url;
};
