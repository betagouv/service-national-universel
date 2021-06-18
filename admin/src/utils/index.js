import { translate } from "./translation";
export * from "snu-lib";
export * from "./translation";
export * from "./colors";

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

export const getFilterLabel = (selected, placeholder = "Choisissez un filtre") => {
  if (Object.keys(selected).length === 0) return placeholder;
  const translated = Object.keys(selected).map((item) => {
    return translate(item);
  });
  return translated.join(", ");
};

export const confirmMessageChangePhase1Presence = (value) => {
  if (!value) return;
  const label = value === "true" ? "Présent" : "Absent";
  let message = `ATTENTION, vous allez passer ce volontaire "${label}" au séjour de cohésion. `;
  if (value === "true") message += "Une attestation de réalisation de la phase 1 du SNU lui sera rendu disponible au téléchargement depuis son espace volontaire.";
  return confirm(message);
};

export const ENABLE_ASSIGN_CENTER = false;
export const ENABLE_ASSIGN_MEETING_POINT = false;
