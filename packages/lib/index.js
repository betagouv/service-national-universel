import { WITHRAWN_REASONS, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "./constants";
import translation from "./translation";
import { ROLES } from "./roles";

import sanitizeHtml from "sanitize-html";

const isInRuralArea = (v) => {
  if (!v.populationDensity) return null;
  return ["PEU DENSE", "TRES PEU DENSE"].includes(v.populationDensity) ? "true" : "false";
};

// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
function isEndOfInscriptionManagement2021() {
  return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}

function inscriptionModificationOpenForYoungs(cohort) {
  if (!cohort?.inscriptionModificationEndDate) return false;
  return new Date() < new Date(cohort.inscriptionModificationEndDate);
}

function inscriptionCreationOpenForYoungs(cohort) {
  if (!cohort?.inscriptionEndDate) return false;
  return new Date() < new Date(cohort.inscriptionEndDate);
}

function reInscriptionModificationOpenForYoungs(env) {
  if (env !== undefined && env !== "production") return true;

  return new Date() >= new Date(2023, 10, 6, 8); // @todo: reInscription end date / should come from db
}

function shouldForceRedirectToReinscription(young) {
  return (
    young.cohort === "à venir" && [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REINSCRIPTION].includes(young.status)
  );
}

function hasAccessToReinscription(young) {
  if (shouldForceRedirectToReinscription(young)) return true;

  if (young.cohort === "à venir" && (young.status === YOUNG_STATUS.VALIDATED || young.status === YOUNG_STATUS.WAITING_LIST)) {
    return true;
  }

  if (young.status === YOUNG_STATUS.VALIDATED && young.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && young.departSejourMotif !== "Exclusion") {
    return true;
  }

  return false;
}

function shouldForceRedirectToInscription(young, isInscriptionModificationOpen = false) {
  return (
    young.cohort !== "à venir" &&
    ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.REINSCRIPTION].includes(young.status) ||
      (isInscriptionModificationOpen && young.status === YOUNG_STATUS.WAITING_VALIDATION && young.inscriptionStep2023 !== "DONE"))
  );
}

const getFilterLabel = (selected, placeholder = "Choisissez un filtre", prelabel = "") => {
  if (Object.keys(selected).length === 0) return placeholder;
  const translator = (item) => {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (prelabel === "Pièces jointes") {
      return translation.translateApplicationFileType(item);
    } else if (prelabel === "Dossier d’éligibilité aux Préparations Militaires") {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else if (prelabel === "Place occupées") {
      return translation.translateMission(item);
    } else if (prelabel === "Statut") {
      return translation.translateInscriptionStatus(item);
    } else {
      return translation.translate(item);
    }
  };
  const translated = Object.keys(selected).map((item) => {
    return translator(item);
  });
  let value = translated.join(", ");
  if (prelabel) value = prelabel + " : " + value;
  return value;
};

const getSelectedFilterLabel = (selected, prelabel) => {
  if (Array.isArray(selected)) {
    if (selected[0] === "FROMDATE" && selected[2] === "TODATE") {
      let formatedFROMDATE = selected[1].split("-").reverse().join("/");
      let formatedTODATE = selected[3].split("-").reverse().join("/");
      return "Date de debut : " + formatedFROMDATE + " • Date de fin : " + formatedTODATE;
    }
  }
  const translator = (item) => {
    if (prelabel === "Statut phase 2") {
      return translation.translatePhase2(item);
    } else if (prelabel === "Statut phase 1") {
      return translation.translatePhase1(item);
    } else if (prelabel === "Statut mission (candidature)") {
      return translation.translateApplication(item);
    } else if (prelabel === "Equivalence de MIG") {
      return translation.translateEquivalenceStatus(item);
    } else if (prelabel === "Statut contrats") {
      return translation.translateEngagement(item);
    } else if (prelabel === "Statut fichier phase 1") {
      return translation.translateFileStatusPhase1(item);
    } else if (prelabel === "Visibilité") {
      return translation.translateVisibilty(item);
    } else if (prelabel === "Dossier d’éligibilité aux Préparations Militaires") {
      return translation.translateStatusMilitaryPreparationFiles(item);
    } else if (prelabel === "Source") {
      return translation.translateSource(item);
    } else if (prelabel === "Place occupées") {
      return translation.translateMission(item);
    } else {
      return translation.translate(item);
    }
  };
  let value = "";
  if (typeof selected === "object") {
    const translated = selected.map((item) => {
      return translator(item);
    });
    value = translated.join(", ");
  } else value = selected;
  if (prelabel) value = prelabel + " : " + value;
  return value;
};

const getResultLabel = (e, pageSize) => `${pageSize * e.currentPage + 1}-${pageSize * e.currentPage + e.displayedResults} sur ${e.numberOfResults}`;

const getLabelWithdrawnReason = (value) => WITHRAWN_REASONS.find((e) => e.value === value)?.label || value;

function canUpdateYoungStatus({ body, current }) {
  if (!body || !current) return true;
  const allStatus = ["status", "statusPhase1", "statusPhase2", "statusPhase3", "statusMilitaryPreparationFiles", "statusPhase2Contract"];
  if (!allStatus.some((s) => body[s] !== current[s])) return true;

  const youngStatus = body.status === "VALIDATED" && !["REINSCRIPTION", "VALIDATED"].includes(current.status);
  const youngStatusPhase1 = body.statusPhase1 === "DONE" && current.statusPhase1 !== "DONE";
  const youngStatusPhase2 = body.statusPhase2 === "VALIDATED" && current.statusPhase2 !== "VALIDATED";
  const youngStatusPhase3 = body.statusPhase3 === "VALIDATED" && current.statusPhase3 !== "VALIDATED";
  const youngStatusMilitaryPrepFiles = body.statusMilitaryPreparationFiles === "VALIDATED" && current.statusMilitaryPreparationFiles !== "VALIDATED";
  const youngStatusPhase2Contract = body.statusPhase2Contract === "VALIDATED" && current.statusPhase2Contract !== "VALIDATED";

  const notAuthorized = youngStatus || youngStatusPhase1 || youngStatusPhase2 || youngStatusPhase3 || youngStatusMilitaryPrepFiles || youngStatusPhase2Contract;

  return !notAuthorized;
}

function canUserUpdateYoungStatus(actor) {
  if (actor) {
    return [ROLES.ADMIN].includes(actor.role);
  } else {
    return false;
  }
}

const SESSIONPHASE1ID_CANCHANGESESSION = ["627cd8b873254d073af93147", "6274e6359ea0ba074acf6557"];

const youngCanChangeSession = ({ statusPhase1, status, sessionPhase1Id }) => {
  //   console.log([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(status), "alorss?");
  if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(status)) return true;
  if ([YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION].includes(statusPhase1) && status === YOUNG_STATUS.VALIDATED) {
    return true;
  }
  if ([YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE].includes(statusPhase1) && SESSIONPHASE1ID_CANCHANGESESSION.includes(sessionPhase1Id)) {
    return true;
  }

  if (statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE) return true;
  return false;
};
const formatPhoneNumberFR = (tel) => {
  if (!tel) return "";
  const regex = /^((?:(?:\+|00)33|0)\s*[1-9])((?:[\s.-]*\d{2}){4})$/;
  const global = tel.match(regex);
  if (global?.length !== 3) {
    return tel;
  }
  const rest = global[2].match(/.{1,2}/g);
  const formatted = `${global[1]} ${rest.join(" ")}`;
  return formatted;
};

const htmlCleaner = (text) => {
  return sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });
};

const formatMessageForReadingInnerHTML = (content) => {
  const cleanedMessage = htmlCleaner(content);
  const message = cleanedMessage.replace(/\\n/g, "<br>").replace(/\\r/g, "<br>");
  return message;
};

export {
  isEndOfInscriptionManagement2021,
  inscriptionModificationOpenForYoungs,
  inscriptionCreationOpenForYoungs,
  reInscriptionModificationOpenForYoungs,
  shouldForceRedirectToReinscription,
  shouldForceRedirectToInscription,
  hasAccessToReinscription,
  isInRuralArea,
  getFilterLabel,
  getSelectedFilterLabel,
  getResultLabel,
  getLabelWithdrawnReason,
  canUpdateYoungStatus,
  canUserUpdateYoungStatus,
  youngCanChangeSession,
  formatPhoneNumberFR,
  formatMessageForReadingInnerHTML,
  htmlCleaner,
};

export * from "./academy";
export * from "./colors";
export * from "./constants";
export * from "./date";
export * from "./excelExports";
export * from "./file";
export * from "./phone-number";
export * from "./plan-de-transport";
export * from "./region-and-departments";
export * from "./roles";
export * from "./sessions";
export * from "./todo.constants";
export * from "./translation";
export * from "./zammood";
export * from "./transport-info";
