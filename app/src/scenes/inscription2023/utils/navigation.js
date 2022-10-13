export const STEPS = {
  COORDONNEES: "COORDONNEES",
  CONSENTEMENTS: "CONSENTEMENTS",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  UPLOAD: "UPLOAD",
  CONFIRM: "CONFIRM",
  DONE: "DONE",
};

export const STEP_LIST = [
  { name: STEPS.COORDONNEES, url: "coordonnee" },
  { name: STEPS.CONSENTEMENTS, url: "consentement" },
  { name: STEPS.REPRESENTANTS, url: "representants" },
  { name: STEPS.DOCUMENTS, url: "documents", allowNext: true },
  { name: STEPS.UPLOAD, url: "televersement" },
  { name: STEPS.CONFIRM, url: "confirm" },
  { name: STEPS.DONE, url: "done" },
];

export const getStepFromUrlParam = (param) => {
  return STEP_LIST.find(({ url }) => url === param)?.name || STEPS.COORDONNEES;
};
