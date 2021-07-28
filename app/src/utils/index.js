import passwordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "snu-lib";
export * from "snu-lib";
export * from "./crisp";
import { environment } from "../config";

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

export function isInscription2021Closed() {
  return new Date() > new Date("2021", "04", "01");
}

const permissionApp = (y) => {
  if (!y) false;
  return y?.status !== YOUNG_STATUS.REFUSED && y?.status !== YOUNG_STATUS.WITHDRAWN;
};

export function permissionPhase1(y) {
  if (!permissionApp(y)) return false;
  return ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST].includes(y.status);
}

export function permissionPhase2(y) {
  if (!permissionApp(y)) return false;
  return ![YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(y.phase) || y.statusPhase1 === "AFFECTED" || y.statusPhase1 === "DONE";
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
}

export const ENABLE_CHOOSE_MEETING_POINT = false;

const FORCE_DISBALED_PM = false;
export const ENABLE_PM = environment !== "production" && !FORCE_DISBALED_PM;
