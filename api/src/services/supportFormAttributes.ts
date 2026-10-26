import Joi from "joi";
import { departmentList, getSafeExternalRedirectUrl, isInternalRedirectUrl, regionList } from "snu-lib";

// Attributs de contact transmis à SNUpport et affichés dans la fiche ticket des agents nationaux.
// Le formulaire public est anonyme : chaque valeur est bornée ici pour qu'aucune ne devienne un lien
// ou un contenu choisi par l'expéditeur (FH15, GOO-6).

/** Rôles possibles après la requalification de `/ticket/form` (checkRole). */
export const PUBLIC_FORM_ROLES = ["young exterior", "admin exterior", "unknown"];

export const SCHEMA_SUPPORT_DEPARTMENT = Joi.string().valid(...departmentList);
export const SCHEMA_SUPPORT_REGION = Joi.string().valid(...regionList);

/**
 * « Page précédente » : les fronts envoient le chemin de la page d'origine (`window.location.pathname`).
 * Seul un chemin relatif ou une URL https vers un front SNU connu est conservé (PM32) ; toute autre
 * valeur est abandonnée plutôt que de bloquer la demande d'aide. Un anonyme ne doit pas pouvoir déposer
 * un lien https arbitraire, présenté aux agents du support comme une métadonnée interne (hameçonnage).
 */
export function normalizeFromPage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isInternalRedirectUrl(trimmed)) return trimmed;
  return getSafeExternalRedirectUrl(trimmed);
}
