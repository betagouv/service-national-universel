import PasswordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3, REGLEMENT_INTERIEUR_VERSION, isCohortTooOld, EQUIVALENCE_STATUS } from "snu-lib";
export * from "snu-lib";
import slugify from "slugify";
import { isCohortDone } from "./cohorts";
import { toastr } from "react-redux-toastr";
import { INSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "./navigation";
import store from "@/redux/store";

function addOneDay(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

/*  
  Un jeune doit réaccepter le Reglement intérieur si le départ de sa cohorte est 
  apres la date de mise en place du dernier reglement (et s'il ne l'a pas déja 
  accepté).
*/
export function shouldReAcceptRI(young, cohort) {
  const newRiDate = new Date(REGLEMENT_INTERIEUR_VERSION);
  const cohortStartDate = new Date(cohort?.dateStart);
  if (permissionPhase1(young) && cohortStartDate >= newRiDate && young?.acceptRI != REGLEMENT_INTERIEUR_VERSION) {
    return true;
  }
  return false;
}

export function getPasswordErrorMessage(v) {
  if (!v) return "Ce champ est obligatoire";
  const schema = new PasswordValidator();
  schema
    .is()
    .min(12) // Minimum length 12
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols

  if (!schema.validate(v)) {
    return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
}

const permissionApp = (y) => {
  if (!y) return false;
  if (y.status === YOUNG_STATUS.ABANDONED) return false;
  return y?.status !== YOUNG_STATUS.REFUSED;
};

export function hasCompletedPhase2(y) {
  if ([YOUNG_STATUS_PHASE2.VALIDATED, YOUNG_STATUS_PHASE2.EXEMPTED].includes(y.statusPhase2)) {
    return true;
  }
  return false;
}

export function isDoingPhase1(young) {
  return (
    [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED].includes(young.status) &&
    [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.WAITING_AFFECTATION].includes(young.statusPhase1)
  );
}

export function hasCompletedPhase1(y) {
  if ([YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(y.statusPhase1)) {
    return true;
  }
  return false;
}

export function wasYoungExcluded(y) {
  return y?.departSejourMotif === "Exclusion";
}

export function permissionChangeCohort(y, date) {
  if (!permissionApp(y)) return false;
  if (wasYoungExcluded(y)) return false;
  const now = new Date();
  const limit = addOneDay(date);
  if (y.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && now < limit) return false;
  return true;
}

export function permissionPhase1(y) {
  if (!permissionApp(y)) return false;
  if (y.cohort === "à venir") return false;
  return (
    (![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN].includes(y.status) &&
      y.statusPhase1 !== YOUNG_STATUS_PHASE1.NOT_DONE &&
      !wasYoungExcluded(y)) ||
    y.statusPhase1 === YOUNG_STATUS_PHASE1.DONE
  );
}

export function hasAccessToPhase2(young) {
  if (!young) return false;
  if (young.statusPhase2 === "VALIDATED") return true;
  if (young.status === YOUNG_STATUS.WITHDRAWN) return false;
  const userIsDoingAMission = young.phase2ApplicationStatus.some((status) => ["VALIDATED", "IN_PROGRESS"].includes(status));
  const hasEquivalence = [EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(young.status_equivalence);

  const { cohort } = store.getState().Cohort;
  if (isCohortTooOld(cohort) && !userIsDoingAMission && !hasEquivalence) {
    return false;
  }
  if (wasYoungExcluded(young)) return false;
  return true;
}

export function permissionPhase2(y) {
  if (wasYoungExcluded(y)) return false;
  if (!hasAccessToPhase2(y)) return false;
  if (y.statusPhase2OpenedAt && new Date(y.statusPhase2OpenedAt) < new Date()) return true;

  // If young has validated phase 2
  if (y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) return true;
  // If young has done phase 1 or was exempted.
  if ([YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(y.statusPhase1)) return true;

  return false;
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return (y.status !== YOUNG_STATUS.WITHDRAWN && y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) || y.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED;
}

// Only people who is already doing phase3 or has done phase3 has access to it.
export const hasAccessToPhase3 = (young) => {
  const { WAITING_VALIDATION, VALIDATED } = YOUNG_STATUS_PHASE3;
  if ([WAITING_VALIDATION, VALIDATED].includes(young.statusPhase3)) return true;
  return false;
};

// from the end of the cohort's last day
export function isYoungCanApplyToPhase2Missions(young) {
  if (young.statusPhase2OpenedAt && new Date(young.statusPhase2OpenedAt) < new Date()) return true;
  const hasYoungPhase1DoneOrExempted = [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1);
  return isCohortDone(young.cohort, 1) && hasYoungPhase1DoneOrExempted;
}

export const HERO_IMAGES_LIST = ["login.jpg", "phase3.jpg", "rang.jpeg"];

export const ENABLE_PM = true;

export function urlWithScheme(url) {
  if (!/^https?:\/\//i.test(url)) return `http://${url}`;
  return url;
}

export const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }
};

export function slugifyFileName(str) {
  return slugify(str, { replacement: "-", remove: /[*+~.()'"!:@]/g });
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Calculer la distance haversine entre deux points géographiques
export function getDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371; // Rayon de la Terre en kilomètres
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return distance;
}

export const regexPhoneFrenchCountries = /^((00|\+)(33|590|594|262|596|269|687|689|508|681)|0)[1-9]?(\d{8})$/;

export const debounce = (fn, delay) => {
  let timeOutId;
  return function (...args) {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const validateId = (id) => {
  const idRegex = /^[0-9a-fA-F]{24}$/;
  return idRegex.test(id);
};

export const desktopBreakpoint = 768;

export function displaySignupToast(user) {
  const url = window.location.pathname;
  const shouldDisplaySignupToast =
    !url.includes("/representants-legaux") &&
    ((user.status === YOUNG_STATUS.IN_PROGRESS && user.inscriptionStep2023 !== INSCRIPTION_STEPS.EMAIL_WAITING_VALIDATION) ||
      (user.status === YOUNG_STATUS.REINSCRIPTION && user.reInscriptionStep2023 !== REINSCRIPTION_STEPS.ELIGIBILITE));

  if (shouldDisplaySignupToast) {
    toastr.success("Connexion réussie", "Vous pouvez reprendre votre inscription là où vous l'avez laissée.", { timeOut: 3 });
  }
}
