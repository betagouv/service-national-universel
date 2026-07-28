# Anonymisation jeunes — identification des 3 populations

> Périmètre : anonymisation RGPD des jeunes sur **admin (Mongo + S3 + ES)**, **support (snupport)** et **Brevo**.
> Ce document (1) définit et prépare les 3 requêtes d'identification, puis (2) rappelle le runbook d'anonymisation.
> Opération **irréversible** : toujours compter (lecture seule) avant d'exécuter quoi que ce soit.

Collection Mongo : `youngs`. Exclusions standard appliquées aux 3 populations : `anonymized ≠ true` et `status ≠ DELETED`.

---

## 1. Les 3 populations (définitions retenues)

| # | Population | Filtre Mongo | Source code |
|---|---|---|---|
| 1 | **Cohorte à venir** | `{ cohort: "à venir" }` | valeur littérale gérée dans `account.ts`, `young/index.ts`, `referentController.ts` |
| 2 | **En attente d'affectation** | `{ statusPhase1: "WAITING_AFFECTATION" }` | `translation.ts` → « En attente d'affectation » |
| 3 | **Listes complémentaires** | `{ $or: [ { status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" } ] }` | les deux champs traduits « Sur liste complémentaire » |

### Filtres complets (avec exclusions standard)

```js
// base réutilisable
const base = { anonymized: { $ne: true }, status: { $ne: "DELETED" } };

// 1 — Cohorte à venir
{ ...base, cohort: "à venir" }

// 2 — En attente d'affectation
{ ...base, statusPhase1: "WAITING_AFFECTATION" }

// 3 — Listes complémentaires
{ ...base, $or: [ { status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" } ] }
```

---

## 2. Requêtes d'identification (lecture seule)

### 2.0 — Pré-check : valeurs exactes de « à venir »

`referentController.ts:950` teste `cohort === "à venir "` (**espace final**) alors que la ligne 963 teste `"à venir"` (sans espace). Il peut donc exister des variantes en base — à vérifier avant de figer le filtre de la population 1 :

```bash
mongosh "$MONGO_URL" --quiet --eval '
  printjson(db.youngs.distinct("cohort", { cohort: /à venir/i }));
'
```

Si une variante avec espace existe, remplacer `cohort: "à venir"` par `cohort: { $in: ["à venir", "à venir "] }` (ou un `$regex: /^à venir\s*$/i`).

### 2.1 — Comptages (les 3 + union distincte)

```bash
mongosh "$MONGO_URL" --quiet --eval '
  const base = { anonymized: { $ne: true }, status: { $ne: "DELETED" } };
  print("1. cohorte à venir     : " + db.youngs.countDocuments({ ...base, cohort: "à venir" }));
  print("2. en attente affect.  : " + db.youngs.countDocuments({ ...base, statusPhase1: "WAITING_AFFECTATION" }));
  print("3. listes complément.  : " + db.youngs.countDocuments({ ...base, $or: [ { status: "WAITING_LIST" }, { statusPhase1: "WAITING_LIST" } ] }));
  print("UNION (distinct)       : " + db.youngs.countDocuments({ ...base, $or: [ { cohort: "à venir" }, { statusPhase1: { $in: ["WAITING_AFFECTATION","WAITING_LIST"] } }, { status: "WAITING_LIST" } ] }));
'
```

> Les 3 populations **se recoupent** (un jeune `cohort:"à venir"` est presque toujours `statusPhase1:"WAITING_AFFECTATION"`). On **ne peut pas additionner** les 3 comptages — la ligne UNION donne le vrai total de jeunes distincts qui seraient anonymisés si l'on traitait les 3.

### 2.2 — Diagnostic population 2 (vérifier l'étendue)

`WAITING_AFFECTATION` est la **valeur par défaut** de `statusPhase1`. Cette ventilation par `status` général révèle ce que le filtre capture réellement (inscriptions en cours, refusées, non éligibles…) :

```bash
mongosh "$MONGO_URL" --quiet --eval '
  db.youngs.aggregate([
    { $match: { statusPhase1: "WAITING_AFFECTATION", anonymized: { $ne: true }, status: { $ne: "DELETED" } } },
    { $group: { _id: "$status", n: { $sum: 1 } } },
    { $sort: { n: -1 } }
  ]).forEach(r => print((r._id + "                ").slice(0,18) + " : " + r.n));
'
```

### 2.3 — Échantillon / export (PII — à manipuler avec précaution)

```bash
# échantillon de contrôle (10 docs, champs limités)
mongosh "$MONGO_URL" --quiet --eval '
  db.youngs.find(
    { statusPhase1: "WAITING_AFFECTATION", anonymized: { $ne: true }, status: { $ne: "DELETED" } },
    { _id: 1, cohort: 1, status: 1, statusPhase1: 1, source: 1 }
  ).limit(10).forEach(printjson);
'
```

> Pour un export complet destiné à la purge support, réutiliser le pattern de
> `exportOldCohortSupportEmails.ts` (fichier `0600`, gitignoré `emails*.json`, canal chiffré,
> suppression après purge). ⚠ Ce script filtre **par cohorte** aujourd'hui (cf. §4).

---

## 3. Runbook standard d'anonymisation (rappel)

L'anonymisation détruit la donnée sur **3 systèmes** ; l'ordre est impératif.

### Prérequis (AVANT tout run, ordre impératif)

1. **Export des emails support** (jeune + parents) — AVANT, car l'anonymisation détruit emails **et** patches ; exporté après coup le fichier serait quasi vide *sans erreur* et la purge support raterait tout.
   ```bash
   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
   ```
2. **mongodump complet** — le dump ne couvre **ni S3 ni Brevo** (suppressions définitives).
   ```bash
   mongodump --uri="$MONGO_URL" --out=/backup/$(date +%Y%m%d_%H%M%S)
   ```

### Variables d'environnement (production)

`ENVIRONMENT=production`, `MONGO_URL`, `JWT_SECRET`, `CELLAR_ENDPOINT/KEYID/KEYSECRET`, `BUCKET_NAME`, **`ENABLE_SENDINBLUE=true`** (obligatoire), `SENDINBLUEKEY`. Optionnel : `SLACK_BOT_TOKEN/CHANNEL`.

> **Gotcha critique `ENABLE_SENDINBLUE=true`** : `brevo.api()` court-circuite tout appel si le flag est faux ; `deleteAndVerifyContact` exige une confirmation positive via `getContact` → un appel court-circuité fait échouer la vérif → `BrevoError` → **tout jeune ayant un email échoue** et n'est pas anonymisé. Sans ce flag, le run rate tout le monde.

### Contrôles de sécurité du script

- `DRY_RUN=true` → aperçu/compte (⚠ **ne teste PAS** le chemin d'écriture).
- `YOUNG_ID=<id>` → anonymise **exactement** ce jeune (seul vrai test du write path, irréversible).
- `COHORTS="..."` → surcharge la liste de cohortes (`COHORTS=""` ⇒ abandon, pas de run complet accidentel).
- `SKIP_BREVO=true` → bypass purge Brevo (DB + S3 seulement) ; la désinscription Brevo est alors faite séparément depuis le fichier d'emails exporté.

### Séquence d'exécution

1. Export emails support (§Prérequis 1) → `emails.json`.
2. `mongodump` (§Prérequis 2).
3. **Admin** : anonymisation Mongo (`replaceOne`) + S3 (CNI, consentements) + Brevo :
   ```bash
   # d'abord valider sur 1 jeune réel
   YOUNG_ID=<objectId> npx tsx src/scripts/anonymizeOldCohorts.effect.ts
   # puis le run ciblé
   COHORTS="à venir" npx tsx src/scripts/anonymizeOldCohorts.effect.ts
   ```
4. **Support** : purge snupport à partir de `emails.json` :
   ```bash
   # côté snupport-api (tsx, pas node) — cf. snupport-api/docs/purge-contacts-support.md
   npx tsx src/scripts/purgeContacts.js
   ```
5. **Elasticsearch** : la réindexation / purge de l'index `young` n'est **pas couverte** par le script (PII encore interrogeable tant que le pipeline de reindex n'a pas tourné) — à traiter séparément.

---

## 4. ⚠ Gap d'exécution — populations 2 & 3

Le script d'anonymisation **et** le script d'export support sélectionnent **par `cohort`** (`{ cohort: { $in: OLD_COHORTS } }`), pas par statut.

| Population | Identifiable (§2) | Anonymisable via runbook | `POPULATION=` |
|---|---|---|---|
| 1 — Cohorte à venir | ✅ | ✅ | `cohorte-a-venir` |
| 2 — En attente d'affectation | ✅ | ✅ | `attente-affectation` |
| 3 — Listes complémentaires | ✅ | ✅ | `liste-complementaire` |

> **Résolu.** Les scripts `anonymizeOldCohorts.effect.ts` et `exportOldCohortSupportEmails.ts` acceptent désormais `POPULATION=<nom>` (sélecteur par statut, source de vérité unique partagée avec la garde email). `POPULATION` et `COHORTS` sont exclusifs. Détails : [docs/superpowers/specs/2026-07-28-anonymisation-selecteur-population-design.md](../../docs/superpowers/specs/2026-07-28-anonymisation-selecteur-population-design.md).

Rappel : au run, appliquer le garde-fou §5 (mongodump + DRY_RUN + réconciliation des comptes) — la sélection étant fidèle, elle inclut les inscriptions en cours et les désistés comptés au §5.

---

## 5. Résultats mesurés & décisions (2026-07-28)

Comptages production (exclusions standard appliquées) :

| Requête | Nombre |
|---|---:|
| 1 — cohorte à venir | 23 603 |
| 2 — en attente d'affectation | 48 723 |
| 3 — listes complémentaires | 15 609 |
| **UNION distincte** | **49 059** |

- Une seule valeur `"à venir"` en base (pas de variante avec espace) → filtre pop. 1 propre.
- **Pop. 1 et 3 sont incluses à ~99 % dans la pop. 2** : seulement **336** jeunes hors pop. 2. La définition de la pop. 2 pilote donc tout le périmètre.

Ventilation de la pop. 2 (`statusPhase1: WAITING_AFFECTATION`) par `status` général :

| status | n | nature |
|---|---:|---|
| WITHDRAWN | 24 748 | désistés |
| WAITING_LIST | 15 606 | liste complémentaire |
| VALIDATED | 5 551 | vrai « en attente d'affectation » |
| WAITING_VALIDATION | 1 078 | ⛔ inscription en cours |
| WAITING_CORRECTION | 1 027 | ⛔ inscription en cours |
| REINSCRIPTION | 713 | ⛔ réinscription en cours |

**Décision (explicite) :** population 2 conservée **telle quelle** (48 723), désistés et inscriptions en cours inclus.

> ⚠ **Garde-fou obligatoire au run.** Cette définition inclut **~2 818 inscriptions vivantes** (WAITING_VALIDATION + WAITING_CORRECTION + REINSCRIPTION) et **24 748 désistés**. Le même risque vaut pour la **pop. 1** (`cohort:"à venir"` sans filtre de statut → contient probablement aussi des inscriptions en cours). L'anonymisation étant irréversible (Mongo + S3 + Brevo), tout run devra : (1) `mongodump` préalable ; (2) `DRY_RUN` puis réconciliation du compte affiché avec les comptes ci-dessus ; (3) validation `YOUNG_ID` sur 1 cas réel ; (4) décision explicitement tracée d'inclure ou non les statuts « en cours ». Rappel §4 : les scripts actuels étant cohort-based, aucun run pop. 2/3 n'est possible sans extension préalable.
