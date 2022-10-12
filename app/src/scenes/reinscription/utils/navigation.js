export const STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  NONELIGIBLE: "NONELIGIBLE",
  SEJOUR: "SEJOUR",
  DOCUMENTS: "DOCUMENTS",
  UPLOAD: "UPLOAD",
  CONFIRM: "CONFIRM",
  DONE: "DONE",
};

export const STEP_LIST = [
  { name: STEPS.ELIGIBILITE, url: "eligibilite" },
  { name: STEPS.NONELIGIBLE, url: "noneligible" },
  { name: STEPS.SEJOUR, url: "sejour" },
  { name: STEPS.DOCUMENTS, url: "documents", allowNext: true },
  { name: STEPS.UPLOAD, url: "televersement" },
  { name: STEPS.CONFIRM, url: "confirm" },
  { name: STEPS.DONE, url: "done" },
];

export const getStepFromUrlParam = (param) => {
  return STEP_LIST.find(({ url }) => url === param)?.name || STEPS.ELIGIBILITE;
};
