import passwordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "snu-lib";
export * from "snu-lib";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";

export function getPasswordErrorMessage(v) {
  if (!v) return "Ce champ est obligatoire";
  const schema = new passwordValidator();
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

export function permissionPhase1(y) {
  if (!permissionApp(y)) return false;
  return (
    ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN].includes(y.status) ||
    y.statusPhase1 === YOUNG_STATUS_PHASE1.DONE
  );
}

export function permissionPhase2(y) {
  if (!permissionApp(y)) return false;
  return (
    (y.status !== YOUNG_STATUS.WITHDRAWN &&
      (![YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(y.phase) || y.statusPhase1 === "DONE" || y.statusPhase1 === "EXEMPTED")) ||
    y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ||
    y.cohesionStayPresence === "true"
  );
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return (y.status !== YOUNG_STATUS.WITHDRAWN && y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) || y.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED;
}

export const HERO_IMAGES_LIST = ["login.jpg", "phase3.jpg", "rang.jpeg"];

export const ENABLE_CHOOSE_MEETING_POINT = false;

export const ENABLE_PM = true;

export const htmlCleaner = (text) => {
  const clean = sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });
  return clean;
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
  if (lat1 == lat2 && lon1 == lon2) {
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
