import passwordValidator from "password-validator";

export * from "./region-and-departments";
export * from "./constants";
export * from "./translation";
export * from "./date";
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
