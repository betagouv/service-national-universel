/**
 * Helpers PURS du script anonymizeOldCohorts (sans dépendance Mongo/Brevo/S3),
 * isolés ici pour être testables unitairement sans charger tout le script
 * (qui tire des types mongodb non compilables par ts-jest).
 */

// Liste explicite (vs $regex) : non ambiguë, auto-documentée, robuste à de futures
// cohortes contenant "2022" en sous-chaîne (ex. un hypothétique "CLE 2022-2023").
// Issue de db.youngs.distinct("cohort") au 2026-06 — à re-valider si la donnée évolue.
// Source unique partagée par anonymizeOldCohorts.effect.ts et exportOldCohortSupportEmails.ts.
export const DEFAULT_OLD_COHORTS = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"];

/**
 * Cohortes à anonymiser. Override ponctuel via COHORTS="2019" ou "2019,2020"
 * (ex. test ciblé staging). Sinon la liste par défaut.
 */
export function resolveOldCohorts(): string[] {
  return process.env.COHORTS
    ? process.env.COHORTS.split(",").map((c) => c.trim()).filter(Boolean)
    : DEFAULT_OLD_COHORTS;
}

/**
 * Construit l'update Mongo à partir de l'objet anonymisé.
 * `anonymize()` met les champs à supprimer à `undefined` en comptant sur mongoose
 * pour les traduire en $unset. Le driver brut, lui, IGNORE `undefined` (il laisserait
 * la PII en place). On scinde donc explicitement : valeurs définies → $set, undefined → $unset.
 */
export function buildUpdate(anon: Record<string, any>): { $set?: Record<string, any>; $unset?: Record<string, any> } {
  const set: Record<string, any> = {};
  const unset: Record<string, any> = {};
  for (const [key, value] of Object.entries(anon)) {
    if (key === "_id") continue; // jamais modifier l'identifiant
    if (value === undefined) unset[key] = "";
    else set[key] = value;
  }
  const update: { $set?: Record<string, any>; $unset?: Record<string, any> } = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;
  return update;
}
