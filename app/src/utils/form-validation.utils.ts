import { isPhoneNumberWellFormated } from "snu-lib";
import validator from "validator";

export const validateEmail = (value: string): true | string => {
  return validator.isEmail(value.trim()) || "Veuillez entrer une adresse email valide";
};

export const validatePhoneNumber = (value: { phoneNumber: string; phoneZone: string }): true | string => {
  if (!value.phoneNumber || !value.phoneZone) {
    return "Ce champ est obligatoire";
  }
  return isPhoneNumberWellFormated(value.phoneNumber, value.phoneZone) || "Le numéro de téléphone est invalide";
};
