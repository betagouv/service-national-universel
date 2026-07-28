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

// ──────────────────────────────────────────────────────────────────────────
// Sélection à anonymiser : cohortes (historique) OU population nommée (par statut).
// Valeurs d'énum reproduites en LITTÉRAUX (et non importées de snu-lib) pour garder
// ce module pur et compilable par ts-jest sans charger les types mongo — cf. en-tête.
// Miroir de YOUNG_STATUS / YOUNG_STATUS_PHASE1 (valeurs stables).
// ──────────────────────────────────────────────────────────────────────────
const STATUS_DELETED = "DELETED";
const STATUS_WAITING_LIST = "WAITING_LIST";
const PHASE1_WAITING_AFFECTATION = "WAITING_AFFECTATION";
const PHASE1_WAITING_LIST = "WAITING_LIST";

export type Selection = {
  label: string; // logs / Slack
  matchFilter: Record<string, unknown>; // find() : jeunes à anonymiser / exporter
  guardComplement: Record<string, unknown>; // getProtectedEmails : périmètre « hors cible »
};

type PopulationDef = { label: string; core: Record<string, unknown> };

// Filtres FIGÉS — toute nouvelle population passe par une revue de code.
export const POPULATIONS: Record<string, PopulationDef> = {
  // cohort:"à venir" = valeur littérale figée. Avant un run, pré-check des variantes
  // (ex. "à venir " avec espace final, cf. doc §2.0) ; un écart est rattrapé par la
  // réconciliation DRY_RUN.
  "cohorte-a-venir": { label: "Cohorte à venir", core: { cohort: "à venir" } },
  "attente-affectation": { label: "En attente d'affectation", core: { statusPhase1: PHASE1_WAITING_AFFECTATION } },
  "liste-complementaire": {
    label: "Listes complémentaires",
    core: { $or: [{ status: STATUS_WAITING_LIST }, { statusPhase1: PHASE1_WAITING_LIST }] },
  },
};

// Chemin cohorte (rétro-compat) : comportement historique, SANS status≠DELETED.
export function cohortSelection(cohorts: string[]): Selection {
  return {
    label: `Cohortes ${cohorts.join(", ")}`,
    matchFilter: { cohort: { $in: cohorts }, anonymized: { $ne: true } },
    guardComplement: { cohort: { $nin: cohorts } },
  };
}

// Chemin population : ajoute status≠DELETED (cohérence avec les comptes d'identification).
export function populationSelection(name: string): Selection {
  const def = POPULATIONS[name];
  if (!def) throw new Error(`POPULATION inconnue: "${name}". Attendu: ${Object.keys(POPULATIONS).join(", ")}.`);
  return {
    label: def.label,
    matchFilter: { ...def.core, anonymized: { $ne: true }, status: { $ne: STATUS_DELETED } },
    guardComplement: { $nor: [def.core] },
  };
}

/**
 * Résout la sélection depuis l'environnement. POPULATION et COHORTS sont EXCLUSIFS.
 * PUR : lève un Error simple sur sélecteur invalide (le script Effect le mappe en
 * ConfigError ; l'export le laisse remonter à son catch). Ne jamais appeler au
 * chargement du module (court-circuiterait la gestion d'erreur Effect).
 */
export function resolveSelection(): Selection {
  const populationRaw = process.env.POPULATION;
  const population = populationRaw?.trim();
  const cohortsDefined = process.env.COHORTS !== undefined;

  // POPULATION fourni mais vide/espaces (ex. POPULATION="$X" avec $X non défini) ⇒ abandon
  // fail-closed, comme COHORTS="" — ne jamais retomber en silence sur les cohortes par défaut.
  if (populationRaw !== undefined && !population) {
    throw new Error("POPULATION défini mais vide — abandon (préciser une population ou retirer la variable).");
  }
  if (population && cohortsDefined) {
    throw new Error("POPULATION et COHORTS sont exclusifs — n'en fournir qu'un.");
  }
  if (population) {
    return populationSelection(population); // valide le nom (throw si inconnu)
  }
  const cohorts = resolveOldCohorts();
  if (cohorts.length === 0) {
    throw new Error("COHORTS défini mais vide après parsing — abandon (un $in:[] n'anonymiserait rien).");
  }
  return cohortSelection(cohorts);
}
