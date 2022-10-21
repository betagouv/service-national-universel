export const STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  NONELIGIBLE: "NONELIGIBLE",
  SEJOUR: "SEJOUR",
  CONSENTEMENTS: "CONSENTEMENTS",
  DOCUMENTS: "DOCUMENTS",
  UPLOAD: "UPLOAD",
  WAITING_CONSENT: "WAITING_CONSENT",
  DONE: "DONE",
};

export const STEP_LIST = [
  { name: STEPS.ELIGIBILITE, url: "eligibilite" },
  { name: STEPS.NONELIGIBLE, url: "noneligible" },
  { name: STEPS.SEJOUR, url: "sejour" },
  { name: STEPS.CONSENTEMENTS, url: "consentement" },
  { name: STEPS.DOCUMENTS, url: "documents", allowNext: true },
  { name: STEPS.UPLOAD, url: "televersement" },
  { name: STEPS.WAITING_CONSENT, url: "done" },
  { name: STEPS.DONE, url: "done" },
];

export const getStepFromUrlParam = (param) => {
  return STEP_LIST.find(({ url }) => url === param)?.name;
};
