import PasswordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3, sessions2023 } from "snu-lib";
export * from "snu-lib";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";
import { isCohortDone } from "./cohorts";
function addOneDay(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
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

export function permissionPhase2(y) {
  if (!permissionPhase1(y)) return false;
  return (
    (y.status !== YOUNG_STATUS.WITHDRAWN &&
      (![YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(y.phase) ||
        [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(y.statusPhase1) ||
        y.cohesionStayPresence === "true")) ||
    y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED
  );
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return (y.status !== YOUNG_STATUS.WITHDRAWN && y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) || y.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED;
}

// eslint-disable-next-line no-unused-vars
export function permissionReinscription(_y) {
  // return y.statusPhase1 === YOUNG_STATUS_PHASE1.NOT_DONE && !["Exclusion"].includes(y.departSejourMotif);
  return false;
}

export function isYoungCanApplyToPhase2Missions(young) {
  const hasYoungPhase1DoneOrExempted = [YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1);
  return isCohortDone(young.cohort) && hasYoungPhase1DoneOrExempted;
}

export const HERO_IMAGES_LIST = ["login.jpg", "phase3.jpg", "rang.jpeg"];

export const ENABLE_PM = true;

export const htmlCleaner = (text) => {
  return sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });
};

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

export const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    return dist;
  }
};

export const regexPhoneFrenchCountries = /^((00|\+)(33|590|594|262|596|269|687|689|508|681)|0)[1-9]?(\d{8})$/;

export const canYoungResumePhase1 = (y) => {
  return (
    sessions2023.map((e) => e.name).includes(y.cohort) &&
    y.status === YOUNG_STATUS.WITHDRAWN &&
    ![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED, YOUNG_STATUS_PHASE1.NOT_DONE].includes(y.statusPhase1)
  );
};

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
