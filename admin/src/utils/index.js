import passwordValidator from "password-validator";
import api from "../services/api";
export * from "snu-lib";
export * from "./translateFieldsModel";
import { environment } from "../config";

export const domains = ["Défense et mémoire", "Sécurité", "Solidarité", "Santé", "Éducation", "Culture", "Sport", "Environnement et développement durable", "Citoyenneté"];
export const status = ["Brouillon", "En attente de validation", "En attente de correction", "Validée", "Refusée", "Annulée", "Archivée"];

export const associationTypes = [
  "Agrément jeunesse et éducation populaire",
  "Agrément service civique",
  "Association complémentaire de l'enseignement public",
  "Associations d'usagers du système de santé",
  "Association sportive affiliée à une fédération sportive agréée par l'État",
  "Agrément des associations de protection de l'environnement",
  "Association agréée de sécurité civile",
  "Autre agrément",
];

export const privateTypes = ["Établissement de santé privé d'intérêt collectif", "Entreprise agréée ESUS", "Autre"];
export const publicTypes = ["Collectivité territoriale", "Etablissement scolaire", "Etablissement public de santé", "Etablissement public", "Service de l'Etat"];
export const publicEtatTypes = [
  "SDIS (Service départemental d'Incendie et de Secours)",
  "Gendarmerie",
  "Police",
  "Armées",
  "Autre service de l'état",
  "Autre établissement public",
];

export const corpsEnUniforme = ["SDIS (Service départemental d'Incendie et de Secours)", "Gendarmerie", "Police", "Armées"];

export const confirmMessageChangePhase1Presence = (value) => {
  if (!value) return `Vous allez passer ce volontaire "Non renseigné" au séjour de cohésion. `;
  const label = value === "true" ? "Présent" : "Absent";
  let message = `Vous allez passer ce volontaire "${label}" au séjour de cohésion. `;
  if (value === "true")
    message +=
      'L\'attestation de réalisation de la phase 1 du SNU lui sera rendu disponible au téléchargement depuis son espace volontaire. Son statut de phase 1 au séjour de cohésion passera à "Effectué"';
  else message += 'Son statut de phase 1 au séjour de cohésion passera à "Non réalisé"';
  return message;
};

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

export const userIsResponsibleFromStructureMilitaryPreparation = async (user) => {
  if (!user || !user.structureId) return false;
  const { ok, data } = await api.get(`/structure/${user.structureId}`);
  if (!ok) return false;
  return data?.isMilitaryPreparation === "true";
};

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

export const replaceSpaces = (v) => v?.replace(/\s+/g, "+");
export const getLink = ({ base = "/", filter, filtersUrl = [] }) => {
  if (filter?.region?.length) filtersUrl.push(`REGION=%5B${replaceSpaces(filter?.region?.map((c) => `"${c}"`)?.join("%2C"))}%5D`);
  if (filter?.cohort?.length) filtersUrl.push(`COHORT=%5B${replaceSpaces(filter?.cohort?.map((c) => `"${c}"`)?.join("%2C"))}%5D`);
  if (filter?.department?.length) filtersUrl.push(`DEPARTMENT=%5B${replaceSpaces(filter?.department?.map((c) => `"${c}"`)?.join("%2C"))}%5D`);
  if (filter?.academy?.length) filtersUrl.push(`ACADEMY=%5B${replaceSpaces(filter?.academy?.map((c) => `"${c}"`)?.join("%2C"))}%5D`);
  let res = base;
  if (filtersUrl?.length) res += `?${filtersUrl.join("&")}`;
  return res;
};

export const ENABLE_PM = true;
