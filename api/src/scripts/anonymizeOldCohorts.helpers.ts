/**
 * Helpers PURS du script anonymizeOldCohorts (sans dépendance Mongo/Brevo/S3),
 * isolés ici pour être testables unitairement sans charger tout le script
 * (qui tire des types mongodb non compilables par ts-jest).
 */

// Liste explicite (vs $regex) : non ambiguë, auto-documentée, robuste à de futures
// cohortes contenant "2019" en sous-chaîne (ex. un hypothétique "CLE 2019-2020").
// Restreinte à la seule cohorte 2019 pour ce premier run ; les cohortes suivantes
// (2020, 2021, 2022…) seront traitées ultérieurement, ou ponctuellement via COHORTS=.
// Source unique partagée par anonymizeOldCohorts.effect.ts et exportOldCohortSupportEmails.ts.
export const DEFAULT_OLD_COHORTS = ["2019"];

/**
 * Cohortes à anonymiser. Override ponctuel via COHORTS="2019" ou "2019,2020"
 * (ex. test ciblé staging). Sinon la liste par défaut.
 *
 * `!== undefined` (et PAS la truthiness) : COHORTS="" — le cas le plus probable d'un
 * override accidentel, ex. COHORTS="$TARGET" avec $TARGET non défini — doit donner []
 * (attrapé par la garde d'abandon des scripts), surtout pas retomber en silence sur la
 * liste complète et déclencher un run de production intégral.
 */
export function resolveOldCohorts(): string[] {
  return process.env.COHORTS !== undefined
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
