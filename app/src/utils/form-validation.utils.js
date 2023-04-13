import { PHONE_ZONES, isPhoneNumberWellFormated } from "snu-lib/phone-number";
import validator from "validator";

export const requiredErrorMessage = "Ce champ est obligatoire.";

export const validateRequired = ({ value }) => !value && requiredErrorMessage;

export const validatePassword = ({ value }) => {
  if (!value) return requiredErrorMessage;
  const isPasswordValid = validator.isStrongPassword(value, { minLength: 12, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 });
  if (!isPasswordValid) {
    return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
};

export const validateEmail = ({ value }) => {
  if (!value) return requiredErrorMessage;
  return !validator.isEmail(value.trim()) && "Veuillez saisir une adresse email valide.";
};

export const validatePhoneNumber = ({ value }) => {
  if (!value.phoneNumber) return requiredErrorMessage;
  return !isPhoneNumberWellFormated(value.phoneNumber, value.phoneZone) && PHONE_ZONES[value.phoneZone].errorMessage;
};
