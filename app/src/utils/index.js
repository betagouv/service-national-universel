import passwordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "snu-lib";
export * from "snu-lib";
import { environment } from "../config";
import sanitizeHtml from "sanitize-html";

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
  return ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST].includes(y.status) && y.statusPhase1 !== YOUNG_STATUS_PHASE1.WITHDRAWN;
}

export function permissionPhase2(y) {
  if (!permissionApp(y)) return false;
  return (
    y.statusPhase2 !== YOUNG_STATUS_PHASE2.WITHDRAWN &&
    (![YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(y.phase) || y.statusPhase1 === "DONE" || y.statusPhase1 === "EXEMPTED")
  );
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return y.statusPhase3 !== YOUNG_STATUS_PHASE3.WITHDRAWN && y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
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
