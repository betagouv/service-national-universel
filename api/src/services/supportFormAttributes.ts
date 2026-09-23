import Joi from "joi";
import { departmentList, regionList } from "snu-lib";

// Attributs de contact transmis à SNUpport et affichés dans la fiche ticket des agents nationaux.
// Le formulaire public est anonyme : chaque valeur est bornée ici pour qu'aucune ne devienne un lien
// ou un contenu choisi par l'expéditeur (FH15, GOO-6).

/** Rôles possibles après la requalification de `/ticket/form` (checkRole). */
export const PUBLIC_FORM_ROLES = ["young exterior", "admin exterior", "unknown"];

export const SCHEMA_SUPPORT_DEPARTMENT = Joi.string().valid(...departmentList);
export const SCHEMA_SUPPORT_REGION = Joi.string().valid(...regionList);

/**
 * « Page précédente » : les fronts envoient le chemin de la page d'origine (`window.location.pathname`).
 * Seul un chemin relatif ou une URL https est conservé ; toute autre valeur est abandonnée plutôt que
 * de bloquer la demande d'aide.
 */
export function normalizeFromPage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\/(?![/\\])[^\s]*$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
