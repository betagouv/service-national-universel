# Spec — Sélecteur par population pour l'anonymisation RGPD des jeunes

**Date** : 2026-07-28
**Branche** : `feat/anonymisation-jeunes-identification-499b0b`
**Statut** : design validé, prêt pour plan d'implémentation
**Contexte amont** : [api/docs/anonymisation-jeunes-identification.md](../../../api/docs/anonymisation-jeunes-identification.md)

## 1. Contexte & problème

L'anonymisation RGPD des jeunes (Mongo + S3 + Brevo + purge support) est aujourd'hui pilotée **par cohorte** :

- `api/src/scripts/anonymizeOldCohorts.effect.ts` — query `{ cohort: { $in: OLD_COHORTS }, anonymized: { $ne: true } }`.
- `api/src/scripts/exportOldCohortSupportEmails.ts` — même sélection par cohorte (source unique `resolveOldCohorts()` dans `anonymizeOldCohorts.helpers.ts`).
- `api/src/services/rgpdEmailGuard.ts` — la garde « email partagé » définit le périmètre « hors cible » par `cohort: { $nin: cohorts }`, soit **le complément du sélecteur**.

On doit désormais cibler des populations définies **par statut** :

| Population | Filtre cœur | Compte prod (2026-07-28) |
|---|---|---:|
| Cohorte à venir | `{ cohort: "à venir" }` | 23 603 |
| En attente d'affectation | `{ statusPhase1: "WAITING_AFFECTATION" }` | 48 723 |
| Listes complémentaires | `{ $or: [ { status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" } ] }` | 15 609 |

Les scripts actuels ne savent pas exprimer une sélection par statut, ni en dériver le complément pour la garde email.

## 2. Objectifs / Non-objectifs

**Objectifs**
- Permettre de cibler une des 3 populations par un **nom** (`POPULATION=<nom>`), sur les **deux** scripts.
- Garantir que **export support = anonymisation** (même sélection, source de vérité unique) — sinon la purge support couvre un ensemble différent (bug que le runbook cherche à éviter).
- Généraliser la garde « email partagé » pour un périmètre arbitraire (complément du sélecteur).
- Rétro-compatibilité totale du chemin cohorte existant.

**Non-objectifs**
- Aucune exécution d'anonymisation (le run reste piloté manuellement par l'opérateur, hors périmètre de ce code).
- Pas de sélecteur/requête arbitraire à l'exécution (choix de sécurité, cf. §3).
- Pas d'exclusion cachée de statuts « en cours » (choix « fidèle », cf. §3).
- Pas de couverture de la réindexation Elasticsearch (déjà hors périmètre du script, inchangé).
- Renommage des scripts : non retenu ici (follow-up optionnel, cf. §9).

## 3. Décisions de design (validées)

1. **Registre de populations nommées** (vs requête JSON brute vs flags). Filtres **figés en code**, revus en PR. Justification : opération **irréversible** sur données de **mineurs** → un sélecteur arbitraire (typo, opérateur `$` inattendu) anonymiserait les mauvais documents sans garde-fou ni traçabilité. Le registre est sûr, auditable (label dans logs/Slack), testable, et permet de dériver le complément automatiquement.
2. **Comportement fidèle, aucune exclusion cachée.** La population nommée = exactement l'ensemble compté à l'identification. Cohérence stricte **count = export = anonymisation**. La sécurité vis-à-vis des inscriptions « en cours » passe par le **runbook** (`mongodump` + `DRY_RUN` + réconciliation), pas par une exclusion implicite qui ferait diverger l'export support.

## 4. Architecture & composants

### 4.1 `anonymizeOldCohorts.helpers.ts` (étendu — pur, testable)

Déjà la « source unique partagée » des deux scripts. On y ajoute le registre et la résolution de sélection.

```ts
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

// Filtres FIGÉS — toute nouvelle population passe par une revue de code.
export const POPULATIONS = {
  "cohorte-a-venir":      { label: "Cohorte à venir",          core: { cohort: "à venir" } },
  "attente-affectation":  { label: "En attente d'affectation", core: { statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION } },
  "liste-complementaire": { label: "Listes complémentaires",   core: { $or: [ { status: YOUNG_STATUS.WAITING_LIST }, { statusPhase1: YOUNG_STATUS_PHASE1.WAITING_LIST } ] } },
} as const;

export type Selection = {
  label: string;                        // logs / Slack
  matchFilter: Record<string, unknown>; // find() : à anonymiser / exporter
  guardComplement: Record<string, unknown>; // getProtectedEmails : hors périmètre
};

// Précédence & exclusivité gérées ici (hors YOUNG_ID, traité dans le script).
export function resolveSelection(env = process.env): Selection { /* cf. §5 */ }
```

`resolveSelection` reste **pur** : sur sélecteur invalide (population inconnue, exclusivité violée, cohortes vides) il lève un `Error` simple. Le script d'anonymisation (Effect) l'appelle **dans** le programme et mappe ce throw en `ConfigError` (abandon gracieux + notif Slack) ; le script d'export (async/await) le laisse remonter à son `catch` (log + `exit 1`). Ne jamais résoudre au chargement du module pour ne pas court-circuiter la gestion d'erreur Effect.

- Chemin **population** :
  - `matchFilter = { ...core, anonymized: { $ne: true }, status: { $ne: YOUNG_STATUS.DELETED } }`
  - `guardComplement = { $nor: [ core ] }`
- Chemin **cohorte** (rétro-compat) :
  - `matchFilter = { cohort: { $in: cohorts }, anonymized: { $ne: true } }` (comportement historique inchangé — pas de `status ≠ DELETED`)
  - `guardComplement = { cohort: { $nin: cohorts } }`

On conserve `DEFAULT_OLD_COHORTS` et `resolveOldCohorts()`.

### 4.2 `rgpdEmailGuard.ts` — garde généralisée

```ts
// avant : getProtectedEmails(cohorts: string[])
// après :
export async function getProtectedEmails(outOfPerimeter: Record<string, unknown>): Promise<Set<string>> {
  const youngCursor = YoungModel.find(
    { ...outOfPerimeter, status: { $ne: YOUNG_STATUS.DELETED } },
    { email: 1, parent1Email: 1, parent2Email: 1 },
  ).lean().cursor();
  // … (fratrie + tous référents : inchangé)
}
```

Le `status ≠ DELETED` reste appliqué **par la garde** (fail-safe), en plus de ce que porte `outOfPerimeter`.

### 4.3 `anonymizeOldCohorts.effect.ts`

- `const selection = resolveSelection();`
- `query()` = `YOUNG_ID ? { _id: YOUNG_ID } : selection.matchFilter`.
- Garde-fou d'abandon : appel de `resolveSelection` **dans** le programme, throw mappé en `ConfigError` si sélecteur invalide/vide → échec propre (pas de `$in:[]` / `$nor:[{}]` silencieux).
- `getProtectedEmails(selection.guardComplement)` (chargé une fois, prod + non-DRY + non-SKIP_BREVO).
- Label logs/Slack = `selection.label`.
- `DRY_RUN`, `SKIP_BREVO`, `YOUNG_ID`, `CONCURRENCY` : inchangés.

### 4.4 `exportOldCohortSupportEmails.ts`

- `const selection = resolveSelection();`
- Query = `selection.matchFilter` (projetée email/parents).
- `getProtectedEmails(selection.guardComplement)`.
- `OUT_FILE`, filtrage placeholders `@deleted.snu`/`@delete.com`, mode `0600` : inchangés.

## 5. Résolution du sélecteur (contrat)

Entrées : `POPULATION`, `COHORTS` (env). `YOUNG_ID` est traité en amont **dans le script d'anonymisation** et court-circuite la sélection.

| `POPULATION` | `COHORTS` | Résultat |
|---|---|---|
| défini, connu | absent | sélection population |
| défini, **inconnu** | — | **erreur** (abandon) |
| défini | défini | **erreur** (exclusivité — ambiguïté interdite) |
| absent | défini, non vide | sélection cohorte |
| absent | défini, **vide** après parsing | **erreur** (garde existante) |
| absent | absent | défaut `DEFAULT_OLD_COHORTS` (`["2019"]`) |

`guardComplement` via `$nor` : pour la pop. 3 (`$or`), `$nor:[{$or:[A,B]}]` = « ni A ni B » (De Morgan correct).

## 6. Gestion d'erreurs & gardes

- Sélecteur invalide/vide → erreur typée avant toute écriture (miroir de la garde `COHORTS=""` actuelle).
- Exclusivité `POPULATION` ⊕ `COHORTS` : refus si les deux sont fournis.
- `guardComplement` ne doit jamais être `{ $nor: [ {} ] }` (protégerait *tout* → n'exclurait rien de dangereux mais fausserait l'export) : garanti par la validation du sélecteur (un `core` non vide par construction).
- Fail-safe email inchangé : dans le doute, on **protège** (on ne purge pas).

## 7. Tests (TDD)

Unitaires **purs** (`anonymizeOldCohorts.helpers.spec` / `.test`), sans Mongo :
- `resolveSelection` : chaque cas du tableau §5 (population connue, inconnue, exclusivité, cohortes défaut/vide).
- Les 3 `core` = valeurs attendues (garde contre une dérive silencieuse des filtres).
- `matchFilter` population inclut bien `anonymized ≠ true` **et** `status ≠ DELETED` ; chemin cohorte **sans** `status ≠ DELETED`.
- `guardComplement` = `$nor:[core]` (population) vs `$nin` (cohorte).

Non-régression : `api/src/__tests__/anonymization.test.ts` reste vert. Adapter les éventuels appels de `getProtectedEmails` (signature changée) dans les tests existants.

## 8. Rétro-compatibilité & migration

- Chemin cohorte (2019, ou « à venir » via `COHORTS="à venir"`) : **inchangé**.
- `POPULATION=` est purement **additif**.
- Seul changement de signature interne : `getProtectedEmails` (2 appelants internes, mis à jour). Pas d'API publique.

### Usage après extension

```bash
# export support (AVANT anonymisation) — même sélection
POPULATION=attente-affectation OUT_FILE=./emails-attente.json npx tsx src/scripts/exportOldCohortSupportEmails.ts

# test 1 cas réel (seul vrai test du write path)
YOUNG_ID=<objectId> npx tsx src/scripts/anonymizeOldCohorts.effect.ts

# run population (après mongodump + DRY_RUN + réconciliation)
POPULATION=attente-affectation npx tsx src/scripts/anonymizeOldCohorts.effect.ts
```

## 9. Risques & garde-fous

- **Irréversibilité + inscriptions en cours.** Les pop. 1 & 2 incluent ~2 818 inscriptions vivantes (WAITING_VALIDATION/WAITING_CORRECTION/REINSCRIPTION) et 24 748 désistés — décision explicite de les **garder** (fidèle). Garde-fou = runbook, pas code : `mongodump` → `DRY_RUN`/`YOUNG_ID` → **réconciliation du compte affiché avec les comptes d'identification** avant tout run réel. `ENABLE_SENDINBLUE=true` obligatoire en prod.
- **Nommage.** `anonymizeOldCohorts` devient imprécis. Retenu : garder les noms (préserve l'historique git, limite le churn) + note doc. Renommage éventuel = follow-up séparé.
- **Filtres figés.** Toute nouvelle population = PR (par conception).

## 10. Hors périmètre / follow-ups

- Réindexation/purge index Elasticsearch `young` (déjà hors script).
- Renommage des scripts.
- Extension du sélecteur à d'autres populations (au besoin, par PR).
