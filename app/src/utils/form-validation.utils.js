import { PHONE_ZONES, isPhoneNumberWellFormated } from "snu-lib/phone-number";
import validator from "validator";

const requiredErrorMessage = "Ce champ est obligatoire.";

export const validateRequired = (value) => (!value ? requiredErrorMessage : true);

export const validatePassword = (value) => {
  if (!value) return requiredErrorMessage;
  const isPasswordValid = validator.isStrongPassword(value, { minLength: 12, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 });
  if (!isPasswordValid) {
    return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
  return true;
};

export const validateVerifyPassword = (value, formValues) => {
  if (!value) return requiredErrorMessage;
  if (value !== formValues.newPassword) return "Les mots de passe renseignés doivent être identiques.";
  return true;
};

export const validateEmail = (value) => {
  if (!value) return requiredErrorMessage;
  if (!validator.isEmail(value.trim())) return "Veuillez saisir une adresse email valide.";
  return true;
};

export const validatePhoneNumber = (value) => {
  if (!value.phoneNumber) return requiredErrorMessage;
  if (!isPhoneNumberWellFormated(value.phoneNumber, value.phoneZone)) return PHONE_ZONES[value.phoneZone].errorMessage;
  return true;
};
