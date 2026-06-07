/**
 * Helpers PURS du script anonymizeOldCohorts (sans dépendance Mongo/Brevo/S3),
 * isolés ici pour être testables unitairement sans charger tout le script
 * (qui tire des types mongodb non compilables par ts-jest).
 */

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
