# Sélecteur par population pour l'anonymisation RGPD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à `anonymizeOldCohorts.effect.ts` et `exportOldCohortSupportEmails.ts` de cibler des populations définies par statut (`POPULATION=<nom>`) via un registre nommé unique, en plus du ciblage par cohorte existant.

**Architecture:** Un module pur (`anonymizeOldCohorts.helpers.ts`) expose un registre `POPULATIONS` figé et `resolveSelection()` qui renvoie `{ label, matchFilter, guardComplement }`. Les deux scripts et la garde « email partagé » consomment cette unique source de vérité. La garde est généralisée pour accepter un complément de périmètre arbitraire (`$nor` pour une population, `$nin` pour des cohortes).

**Tech Stack:** TypeScript, Effect TS (script d'anonymisation), Mongoose, Jest + ts-jest.

## Global Constraints

- **Filtres FIGÉS** : le registre `POPULATIONS` est défini en code, revu en PR. Aucune requête arbitraire à l'exécution.
- **Fidèle, pas d'exclusion cachée** : `matchFilter` population = `{ ...core, anonymized: { $ne: true }, status: { $ne: "DELETED" } }`. Chemin cohorte = `{ cohort: { $in: cohorts }, anonymized: { $ne: true } }` (comportement historique, **sans** `status ≠ DELETED`).
- **Complément garde** : population → `{ $nor: [core] }` ; cohorte → `{ cohort: { $nin: cohorts } }`.
- **Exclusivité** : `POPULATION` et `COHORTS` ne peuvent être fournis ensemble (erreur). Sélecteur invalide/vide → erreur (abandon avant toute écriture).
- **Module pur** : `resolveSelection` lève un `Error` simple. Le script Effect le mappe en `ConfigError` ; le script d'export le laisse remonter à son `catch`.
- **Dépendance zéro dans le helper** : valeurs d'énum reproduites en littéraux (miroir de `YOUNG_STATUS`/`YOUNG_STATUS_PHASE1`), pour rester compilable par ts-jest — cf. en-tête du fichier.
- **Rétro-compatibilité** : `COHORTS`/défaut `["2019"]` inchangés ; `POPULATION=` purement additif. Noms de scripts inchangés.
- **Fichiers de test** : nommés `*.test.ts`, sous `src/__tests__/` (jest ignore `src/scripts/`).
- **Commandes** (depuis `api/`) : typecheck = `npm run build` ; tests ciblés = `npx jest src/__tests__/anonymization.test.ts -t "<nom>"`.

**3 populations** (compte prod 2026-07-28) : `cohorte-a-venir` `{ cohort: "à venir" }` (23 603) · `attente-affectation` `{ statusPhase1: "WAITING_AFFECTATION" }` (48 723) · `liste-complementaire` `{ $or: [{ status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" }] }` (15 609).

---

## Task 1 : Registre `POPULATIONS` + `resolveSelection` (module pur) + tests

**Files:**
- Modify: `api/src/scripts/anonymizeOldCohorts.helpers.ts` (append)
- Test: `api/src/__tests__/anonymization.test.ts` (append un `describe`, étendre l'import ligne 25)

**Interfaces:**
- Consumes: `resolveOldCohorts()`, `DEFAULT_OLD_COHORTS` (déjà présents dans le fichier).
- Produces:
  - `type Selection = { label: string; matchFilter: Record<string, unknown>; guardComplement: Record<string, unknown> }`
  - `POPULATIONS: Record<string, { label: string; core: Record<string, unknown> }>`
  - `cohortSelection(cohorts: string[]): Selection`
  - `populationSelection(name: string): Selection`
  - `resolveSelection(): Selection`

- [ ] **Step 1 : Écrire les tests (qui échouent)**

Étendre l'import existant en tête de `api/src/__tests__/anonymization.test.ts` (ligne 25) :

```ts
import { buildUpdate, resolveOldCohorts, DEFAULT_OLD_COHORTS, resolveSelection, POPULATIONS } from "../scripts/anonymizeOldCohorts.helpers";
```

Ajouter ce `describe` à la fin du fichier (après le `describe("resolveOldCohorts …")` existant) :

```ts
describe("resolveSelection (sélection population | cohorte)", () => {
  // process.env est global : on sauvegarde/restaure POPULATION et COHORTS.
  const ORIG_POP = process.env.POPULATION;
  const ORIG_COH = process.env.COHORTS;
  afterEach(() => {
    if (ORIG_POP === undefined) delete process.env.POPULATION;
    else process.env.POPULATION = ORIG_POP;
    if (ORIG_COH === undefined) delete process.env.COHORTS;
    else process.env.COHORTS = ORIG_COH;
  });

  it("registre = 3 populations figées", () => {
    expect(Object.keys(POPULATIONS).sort()).toEqual(["attente-affectation", "cohorte-a-venir", "liste-complementaire"]);
    expect(POPULATIONS["cohorte-a-venir"].core).toEqual({ cohort: "à venir" });
  });

  it("population attente-affectation → matchFilter (anonymized≠true + status≠DELETED) + guardComplement $nor", () => {
    delete process.env.COHORTS;
    process.env.POPULATION = "attente-affectation";
    const sel = resolveSelection();
    expect(sel.label).toBe("En attente d'affectation");
    expect(sel.matchFilter).toEqual({ statusPhase1: "WAITING_AFFECTATION", anonymized: { $ne: true }, status: { $ne: "DELETED" } });
    expect(sel.guardComplement).toEqual({ $nor: [{ statusPhase1: "WAITING_AFFECTATION" }] });
  });

  it("population liste-complementaire → $or status/statusPhase1", () => {
    delete process.env.COHORTS;
    process.env.POPULATION = "liste-complementaire";
    const sel = resolveSelection();
    const core = { $or: [{ status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" }] };
    expect(sel.matchFilter).toEqual({ ...core, anonymized: { $ne: true }, status: { $ne: "DELETED" } });
    expect(sel.guardComplement).toEqual({ $nor: [core] });
  });

  it("population inconnue → throw", () => {
    delete process.env.COHORTS;
    process.env.POPULATION = "n-existe-pas";
    expect(() => resolveSelection()).toThrow(/POPULATION inconnue/);
  });

  it("POPULATION + COHORTS ensemble → throw (exclusifs)", () => {
    process.env.POPULATION = "cohorte-a-venir";
    process.env.COHORTS = "2019";
    expect(() => resolveSelection()).toThrow(/exclusifs/);
  });

  it("sans sélecteur → chemin cohorte par défaut (sans status≠DELETED)", () => {
    delete process.env.POPULATION;
    delete process.env.COHORTS;
    const sel = resolveSelection();
    expect(sel.matchFilter).toEqual({ cohort: { $in: DEFAULT_OLD_COHORTS }, anonymized: { $ne: true } });
    expect(sel.guardComplement).toEqual({ cohort: { $nin: DEFAULT_OLD_COHORTS } });
  });

  it('COHORTS="" → throw (garde d\'abandon)', () => {
    delete process.env.POPULATION;
    process.env.COHORTS = "";
    expect(() => resolveSelection()).toThrow(/vide après parsing/);
  });
});
```

- [ ] **Step 2 : Lancer les tests → échec attendu**

Run: `npx jest src/__tests__/anonymization.test.ts -t "resolveSelection"`
Expected: FAIL — `resolveSelection is not a function` / `POPULATIONS` undefined.

- [ ] **Step 3 : Implémenter dans le helper**

Append à la fin de `api/src/scripts/anonymizeOldCohorts.helpers.ts` :

```ts
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
  const population = process.env.POPULATION?.trim();
  const cohortsDefined = process.env.COHORTS !== undefined;

  if (population && cohortsDefined) {
    throw new Error("POPULATION et COHORTS sont exclusifs — n'en fournir qu'un.");
  }
  if (population) {
    if (!(population in POPULATIONS)) {
      throw new Error(`POPULATION inconnue: "${population}". Attendu: ${Object.keys(POPULATIONS).join(", ")}.`);
    }
    return populationSelection(population);
  }
  const cohorts = resolveOldCohorts();
  if (cohorts.length === 0) {
    throw new Error("COHORTS défini mais vide après parsing — abandon (un $in:[] n'anonymiserait rien).");
  }
  return cohortSelection(cohorts);
}
```

- [ ] **Step 4 : Lancer les tests → succès attendu**

Run: `npx jest src/__tests__/anonymization.test.ts -t "resolveSelection"`
Expected: PASS (7 tests). Vérifier aussi la non-régression du bloc existant : `npx jest src/__tests__/anonymization.test.ts -t "resolveOldCohorts"` → PASS.

- [ ] **Step 5 : Commit**

```bash
git add api/src/scripts/anonymizeOldCohorts.helpers.ts api/src/__tests__/anonymization.test.ts
git commit -m "feat(api): registre POPULATIONS + resolveSelection pour anonymisation par statut"
```

---

## Task 2 : Généraliser `getProtectedEmails` (garde email) — refactor sans changement de comportement

**Files:**
- Modify: `api/src/services/rgpdEmailGuard.ts` (signature + corps de `getProtectedEmails`, ~l.18-33)
- Modify: `api/src/scripts/anonymizeOldCohorts.effect.ts` (appelant, l.248)
- Modify: `api/src/scripts/exportOldCohortSupportEmails.ts` (appelant, l.66)

**Interfaces:**
- Produces: `getProtectedEmails(outOfPerimeter: Record<string, unknown>): Promise<Set<string>>` (avant : `(cohorts: string[])`).
- Note : refactor **iso-comportement** — les appelants passent `{ cohort: { $nin: cohorts } }`, ce qui reconstitue exactement la requête d'avant.

- [ ] **Step 1 : Modifier la signature et le corps de la garde**

Dans `api/src/services/rgpdEmailGuard.ts`, remplacer le bloc commentaire + signature + première requête (l.18-33) :

```ts
/**
 * Ensemble (minuscules) des emails encore rattachés à un dossier actif HORS périmètre :
 * jeunes non supprimés NON ciblés par la sélection (`outOfPerimeter` = complément du
 * sélecteur : `{ cohort: { $nin } }` ou `{ $nor: [core] }`), email + parents, plus tous
 * les référents. Chargé UNE fois (2 requêtes projetées, en cursor).
 * La comparaison se fait en minuscules des deux côtés (documents anciens non normalisés).
 */
export async function getProtectedEmails(outOfPerimeter: Record<string, unknown>): Promise<Set<string>> {
  const protectedEmails = new Set<string>();

  const youngCursor = YoungModel.find(
    { ...outOfPerimeter, status: { $ne: YOUNG_STATUS.DELETED } },
    { email: 1, parent1Email: 1, parent2Email: 1 },
  )
    .lean()
    .cursor();
```

(Le reste de la fonction — boucle jeunes, boucle référents, `return` — est inchangé.)

- [ ] **Step 2 : Mettre à jour l'appelant dans le script d'anonymisation**

Dans `api/src/scripts/anonymizeOldCohorts.effect.ts` (l.248), remplacer :

```ts
    config.ENVIRONMENT === "production" && !DRY_RUN && !SKIP_BREVO ? yield* Effect.tryPromise(() => getProtectedEmails(OLD_COHORTS)) : new Set<string>();
```

par :

```ts
    config.ENVIRONMENT === "production" && !DRY_RUN && !SKIP_BREVO ? yield* Effect.tryPromise(() => getProtectedEmails({ cohort: { $nin: OLD_COHORTS } })) : new Set<string>();
```

- [ ] **Step 3 : Mettre à jour l'appelant dans le script d'export**

Dans `api/src/scripts/exportOldCohortSupportEmails.ts` (l.66), remplacer :

```ts
    const protectedEmails = await getProtectedEmails(cohorts);
```

par :

```ts
    const protectedEmails = await getProtectedEmails({ cohort: { $nin: cohorts } });
```

- [ ] **Step 4 : Typecheck + non-régression**

Run: `npm run build`
Expected: PASS (aucune erreur de type).

Run: `npm test -- src/__tests__/anonymization.test.ts`
Expected: PASS (comportement pur inchangé).

- [ ] **Step 5 : Commit**

```bash
git add api/src/services/rgpdEmailGuard.ts api/src/scripts/anonymizeOldCohorts.effect.ts api/src/scripts/exportOldCohortSupportEmails.ts
git commit -m "refactor(api): getProtectedEmails accepte un complément de périmètre arbitraire"
```

---

## Task 3 : Brancher `resolveSelection` dans `anonymizeOldCohorts.effect.ts`

**Files:**
- Modify: `api/src/scripts/anonymizeOldCohorts.effect.ts` (import l.53, en-tête usage l.32-37, suppression `OLD_COHORTS` l.60-61, suppression `query()` l.73, garde COHORTS l.236-238, résolution sélection, appels l.248/251/252/292)

**Interfaces:**
- Consumes (Task 1) : `resolveSelection()`, `cohortSelection(cohorts)`, `DEFAULT_OLD_COHORTS`, `type Selection`.
- Consumes (Task 2) : `getProtectedEmails(outOfPerimeter)`.

- [ ] **Step 1 : Mettre à jour l'import du helper (l.53)**

Remplacer :

```ts
import { buildUpdate, resolveOldCohorts } from "./anonymizeOldCohorts.helpers";
```

par :

```ts
import { buildUpdate, cohortSelection, resolveSelection, DEFAULT_OLD_COHORTS, type Selection } from "./anonymizeOldCohorts.helpers";
```

- [ ] **Step 2 : Supprimer `OLD_COHORTS` (l.60-61) et `query()` (l.73)**

Supprimer ces deux lignes (et le commentaire l.60) :

```ts
// Cohortes ciblées (liste partagée + override COHORTS) — cf. anonymizeOldCohorts.helpers.
const OLD_COHORTS = resolveOldCohorts();
```

Supprimer la ligne `query` :

```ts
const query = () => (YOUNG_ID ? { _id: YOUNG_ID } : { cohort: { $in: OLD_COHORTS }, anonymized: { $ne: true } });
```

- [ ] **Step 3 : Résoudre la sélection dans le programme + retirer la garde COHORTS**

Dans le corps de `program` (`Effect.gen`), remplacer la garde COHORTS existante (l.233-238) :

```ts
  // Garde-fou : COHORTS surchargé mais vide après parsing ⇒ un $in:[] n'anonymiserait rien.
  // (sans objet si on cible un YOUNG_ID précis.) Couvre aussi COHORTS="" depuis que
  // resolveOldCohorts teste la présence de la variable et non sa truthiness.
  if (!YOUNG_ID && OLD_COHORTS.length === 0) {
    return yield* Effect.fail(new ConfigError({ reason: "COHORTS défini mais vide après parsing — abandon (un $in:[] n'anonymiserait rien)." }));
  }
```

par la résolution de sélection :

```ts
  // Sélection à anonymiser (population nommée ou cohortes). Résolue DANS le programme
  // pour mapper tout sélecteur invalide en ConfigError (abandon gracieux + Slack).
  // YOUNG_ID court-circuite la query et tolère l'absence de sélecteur (garde historique) :
  // on n'exige un sélecteur valide que pour un run de masse.
  let selection: Selection;
  if (YOUNG_ID) {
    selection = cohortSelection(DEFAULT_OLD_COHORTS);
  } else {
    selection = yield* Effect.try({
      try: () => resolveSelection(),
      catch: (reason) => new ConfigError({ reason: reason instanceof Error ? reason.message : String(reason) }),
    });
  }
```

- [ ] **Step 4 : Brancher garde email, query et logs sur `selection`**

Appel garde email (l.248, déjà touché en Task 2) — remplacer :

```ts
    config.ENVIRONMENT === "production" && !DRY_RUN && !SKIP_BREVO ? yield* Effect.tryPromise(() => getProtectedEmails({ cohort: { $nin: OLD_COHORTS } })) : new Set<string>();
```

par :

```ts
    config.ENVIRONMENT === "production" && !DRY_RUN && !SKIP_BREVO ? yield* Effect.tryPromise(() => getProtectedEmails(selection.guardComplement)) : new Set<string>();
```

Collecte des ids (l.251) — remplacer :

```ts
  const ids: Array<{ _id: any }> = yield* Effect.tryPromise(() => YoungModel.find(query()).select("_id").lean());
  logger.info(`${mode}${ids.length} jeunes à anonymiser`);
```

par :

```ts
  const ids: Array<{ _id: any }> = yield* Effect.tryPromise(() =>
    YoungModel.find(YOUNG_ID ? { _id: YOUNG_ID } : selection.matchFilter).select("_id").lean(),
  );
  logger.info(`${mode}${ids.length} jeunes à anonymiser (${selection.label})`);
```

Notif Slack de fin (l.290-293) — remplacer le `text:` :

```ts
      text: `${mode}${processed} jeunes anonymisés${errors > 0 ? `, ${errors} erreurs` : ""}${skipped > 0 ? `, ${skipped} introuvables` : ""} sur ${ids.length} trouvés`,
```

par :

```ts
      text: `${mode}[${selection.label}] ${processed} jeunes anonymisés${errors > 0 ? `, ${errors} erreurs` : ""}${skipped > 0 ? `, ${skipped} introuvables` : ""} sur ${ids.length} trouvés`,
```

- [ ] **Step 5 : Mettre à jour le bloc « Usage » de l'en-tête (l.32-37)**

Remplacer le bloc Usage :

```ts
 * Usage (depuis api/) :
 *   DRY_RUN=true npx tsx src/scripts/anonymizeOldCohorts.effect.ts          # aperçu (compte)
 *   YOUNG_ID=<objectId> npx tsx src/scripts/anonymizeOldCohorts.effect.ts   # test sur 1 jeune réel
 *   COHORTS="2019" npx tsx src/scripts/anonymizeOldCohorts.effect.ts        # run ciblé staging
 *   npx tsx src/scripts/anonymizeOldCohorts.effect.ts                       # run complet
 */
```

par :

```ts
 * Usage (depuis api/) :
 *   DRY_RUN=true npx tsx src/scripts/anonymizeOldCohorts.effect.ts               # aperçu (compte)
 *   YOUNG_ID=<objectId> npx tsx src/scripts/anonymizeOldCohorts.effect.ts        # test sur 1 jeune réel
 *   COHORTS="2019" npx tsx src/scripts/anonymizeOldCohorts.effect.ts             # run ciblé par cohorte
 *   POPULATION=attente-affectation npx tsx src/scripts/anonymizeOldCohorts.effect.ts  # run par population (statut)
 *   npx tsx src/scripts/anonymizeOldCohorts.effect.ts                            # run complet (cohortes par défaut)
 *   # Populations disponibles : cohorte-a-venir | attente-affectation | liste-complementaire
 *   # POPULATION et COHORTS sont exclusifs.
 */
```

- [ ] **Step 6 : Typecheck**

Run: `npm run build`
Expected: PASS. (Le script n'a pas de test unitaire — dépendances Mongo/Effect/Brevo ; le typecheck est le garde-fou, la logique de sélection est couverte par Task 1.)

- [ ] **Step 7 : Commit**

```bash
git add api/src/scripts/anonymizeOldCohorts.effect.ts
git commit -m "feat(api): anonymizeOldCohorts pilotable par POPULATION= (sélection par statut)"
```

---

## Task 4 : Brancher `resolveSelection` dans `exportOldCohortSupportEmails.ts`

**Files:**
- Modify: `api/src/scripts/exportOldCohortSupportEmails.ts` (import l.29, en-tête usage l.18-20, résolution l.36-48, garde email l.66, log l.72-75)

**Interfaces:**
- Consumes (Task 1) : `resolveSelection()`. Consumes (Task 2) : `getProtectedEmails(outOfPerimeter)`.

- [ ] **Step 1 : Mettre à jour l'import (l.29)**

Remplacer :

```ts
import { resolveOldCohorts } from "./anonymizeOldCohorts.helpers";
```

par :

```ts
import { resolveSelection } from "./anonymizeOldCohorts.helpers";
```

- [ ] **Step 2 : Remplacer la résolution + la garde vide (l.36-48)**

Remplacer :

```ts
    const cohorts = resolveOldCohorts();
    // Miroir de la garde du script d'anonymisation : COHORTS défini mais vide (ex.
    // COHORTS="$TARGET" avec $TARGET non défini) ⇒ abandon plutôt qu'un export vide.
    if (cohorts.length === 0) {
      throw new Error("COHORTS défini mais vide après parsing — abandon (un $in:[] n'exporterait rien).");
    }

    // anonymized != true : on ne veut que des emails réels. Un jeune déjà anonymisé
    // a un email placeholder, inutile (et inexploitable) côté support.
    const youngs = await YoungModel.find(
      { cohort: { $in: cohorts }, anonymized: { $ne: true } },
      { email: 1, parent1Email: 1, parent2Email: 1 },
    ).lean();
```

par :

```ts
    // Même sélection que l'anonymisation (source unique) : population nommée ou cohortes.
    // resolveSelection lève sur sélecteur invalide/vide → remonte au catch (log + exit 1).
    const selection = resolveSelection();

    // matchFilter porte déjà anonymized != true : on ne veut que des emails réels
    // (un jeune déjà anonymisé a un email placeholder, inutile côté support).
    const youngs = await YoungModel.find(selection.matchFilter, { email: 1, parent1Email: 1, parent2Email: 1 }).lean();
```

- [ ] **Step 3 : Brancher la garde email (l.66) et le log (l.72-75)**

Remplacer (issu de Task 2) :

```ts
    const protectedEmails = await getProtectedEmails({ cohort: { $nin: cohorts } });
```

par :

```ts
    const protectedEmails = await getProtectedEmails(selection.guardComplement);
```

Remplacer le log final :

```ts
    logger.info(
      `${youngs.length} jeunes (cohortes ${cohorts.join(", ")}) → ${emails.length} emails uniques écrits dans ${OUT_FILE}` +
        ` (${excluded} exclus car partagés avec un dossier actif hors périmètre ou un référent)`,
    );
```

par :

```ts
    logger.info(
      `${youngs.length} jeunes (${selection.label}) → ${emails.length} emails uniques écrits dans ${OUT_FILE}` +
        ` (${excluded} exclus car partagés avec un dossier actif hors périmètre ou un référent)`,
    );
```

- [ ] **Step 4 : Mettre à jour le bloc « Usage » de l'en-tête (l.18-20)**

Remplacer :

```ts
 * Usage (depuis api/) :
 *   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   COHORTS="2019" OUT_FILE=./emails-2019.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 */
```

par :

```ts
 * Usage (depuis api/) :
 *   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   COHORTS="2019" OUT_FILE=./emails-2019.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   POPULATION=attente-affectation OUT_FILE=./emails-attente.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   # Même sélecteur que anonymizeOldCohorts (POPULATION et COHORTS exclusifs).
 */
```

- [ ] **Step 5 : Typecheck**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add api/src/scripts/exportOldCohortSupportEmails.ts
git commit -m "feat(api): export support emails pilotable par POPULATION= (même sélecteur)"
```

---

## Task 5 : Doc — clôturer le gap d'exécution des populations 2 & 3

**Files:**
- Modify: `api/docs/anonymisation-jeunes-identification.md` (§4 tableau + note)

- [ ] **Step 1 : Mettre à jour le §4 (gap d'exécution)**

Dans `api/docs/anonymisation-jeunes-identification.md`, remplacer les lignes du tableau §4 :

```md
| Population | Identifiable maintenant (§2) | Anonymisable via runbook actuel |
|---|---|---|
| 1 — Cohorte à venir | ✅ | ✅ `COHORTS="à venir"` |
| 2 — En attente d'affectation | ✅ | ❌ nécessite extension des scripts (sélecteur par statut) |
| 3 — Listes complémentaires | ✅ | ❌ nécessite extension des scripts (sélecteur par statut) |
```

par :

```md
| Population | Identifiable (§2) | Anonymisable via runbook | `POPULATION=` |
|---|---|---|---|
| 1 — Cohorte à venir | ✅ | ✅ | `cohorte-a-venir` |
| 2 — En attente d'affectation | ✅ | ✅ | `attente-affectation` |
| 3 — Listes complémentaires | ✅ | ✅ | `liste-complementaire` |

> **Résolu.** Les scripts `anonymizeOldCohorts.effect.ts` et `exportOldCohortSupportEmails.ts` acceptent désormais `POPULATION=<nom>` (sélecteur par statut, source de vérité unique partagée avec la garde email). `POPULATION` et `COHORTS` sont exclusifs. Détails : [docs/superpowers/specs/2026-07-28-anonymisation-selecteur-population-design.md](../../docs/superpowers/specs/2026-07-28-anonymisation-selecteur-population-design.md).
```

- [ ] **Step 2 : Remplacer le paragraphe d'extension devenu obsolète**

Toujours dans le §4, remplacer le paragraphe :

```md
Pour exécuter l'anonymisation des populations 2 & 3, il faut au préalable **étendre** `anonymizeOldCohorts.effect.ts` et `exportOldCohortSupportEmails.ts` pour accepter un sélecteur par statut (ex. variable `SELECTOR`/`QUERY`, ou flags dédiés), en conservant les gardes existantes (`anonymized ≠ true`, abandon si sélecteur vide, garde « email partagé »). → Sujet à cadrer séparément (brainstorming + plan) si retenu.
```

par :

```md
Rappel : au run, appliquer le garde-fou §5 (mongodump + DRY_RUN + réconciliation des comptes) — la sélection étant fidèle, elle inclut les inscriptions en cours et les désistés comptés au §5.
```

- [ ] **Step 3 : Commit**

```bash
git add api/docs/anonymisation-jeunes-identification.md
git commit -m "docs(api): populations 2 & 3 anonymisables via POPULATION= (gap clos)"
```

---

## Self-Review (rempli à la rédaction)

**Couverture spec :** registre + resolveSelection (T1) · matchFilter population avec status≠DELETED / cohorte sans (T1) · guardComplement $nor/$nin (T1) · précédence + exclusivité + inconnue + vide (T1) · getProtectedEmails généralisée (T2) · branchement script anonymisation dont YOUNG_ID + label + suppression garde COHORTS (T3) · branchement export (T4) · mécanisme d'erreur pur→ConfigError / propagation export (T1+T3+T4) · rétro-compat cohortes (T1 + tests existants) · note nommage & usage (en-têtes T3/T4 + doc T5). **Aucun gap.**

**Placeholders :** aucun — tout le code et toutes les commandes sont explicites.

**Cohérence des types :** `Selection`, `cohortSelection`, `populationSelection`, `resolveSelection`, `POPULATIONS` identiques de T1 à T4 ; `getProtectedEmails(outOfPerimeter)` cohérent T2→T4.
