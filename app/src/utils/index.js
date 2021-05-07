import passwordValidator from "password-validator";
import { YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "snu-lib";
export * from "snu-lib";
export * from "./translation";
export * from "./colors";

export function getPasswordErrorMessage(v, matomo) {
  if (!v) return "Ce champ est obligatoire";
  const schema = new passwordValidator();
  schema.is().min(8); // Must have symbols

  if (!schema.validate(v)) {
    matomo.logEvent("inscription", "password_failed");
    window.lumiere("sendEvent", "inscription", "password_failed");
    return "Votre mot de passe doit contenir au moins 8 caractères";
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
  return ![YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(y.phase);
}

export function permissionPhase3(y) {
  if (!permissionApp(y)) return false;
  return y.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
}
