# Design — Export des volontaires opt-out 2024-2025

**Date :** 2026-07-24
**Auteur :** Philippe de Mangou (assisté)
**Statut :** Design validé — en attente de plan d'implémentation

## 1. Contexte & objectif

Dans le cadre du cycle RGPD (archivage/anonymisation des cohortes 2024-2025 —
cf. migration `20260713144238-archivage-cohortes-2024-2025`), on dispose d'une liste
d'emails de volontaires ayant **choisi de ne pas refuser** la conservation de leurs
données (« n'a pas cliqué sur le bouton https://www.snu.gouv.fr/refus/ »).

**Objectif :** pour chacun de ces emails, exporter les données des **modèles liés au
volontaire** — champs définis par le dictionnaire « Champs SNU juillet 2026 » (version
**sans les lignes jaunes**) — ainsi que **le ou les représentants légaux** (email + prénom).

## 2. Entrées / Sortie

**Entrées**
- `Optout-2024-2025-Volontaires.xlsx` : **48 854 emails uniques** (colonnes `EMAIL`, `ACTION` ;
  toutes les lignes ont la même action « n'a pas cliqué… refus »).
- `Champs_SNU_juillet2026_sans_lignes_jaunes.xlsx` : dictionnaire de champs
  (`exportName`, `model`, `field`, `required`, `type`, `default`, `description`) —
  définit **quels champs exporter par modèle**.

**Sortie**
- **1 fichier Excel**, **1 onglet par modèle** (7 onglets), colonnes = champs du dico
  pour ce modèle. Chaque onglet non-Young porte une colonne `youngEmail` de traçabilité.
- Un **rapport** de fin d'exécution (comptes par onglet, emails non trouvés).

## 3. Décisions validées

| Sujet | Décision |
|---|---|
| Source des données | **Mongo prod en lecture seule** |
| Forme du livrable | **Script Effect TS autonome** dans `api/src/scripts/` |
| Format de sortie | **Excel, un onglet par modèle** |
| Correspondance | **Par email fourni, toutes cohortes** (la liste EST le filtre) |
| `area` / `importplandetransport` | **Exclus** (non rattachables à un young) |
| Représentants légaux | `parent1*` / `parent2*` (email + prénom) sur l'onglet Young |

## 4. Architecture

- **Fichiers**
  - `api/src/scripts/exportOptoutVolontaires.effect.ts` — script principal (Effect + tsx).
  - `api/src/scripts/exportOptoutVolontaires.helpers.ts` — helpers purs & testables
    (normalisation email, chunking, sélection de champs, aplatissement des valeurs).
  - `api/src/scripts/exportOptoutVolontaires.fields.ts` — config `MODEL → string[]`
    (les champs du dico), pré-générée depuis le xlsx et commitée (pas de parsing xlsx au runtime).
- **Lancement** (depuis `api/`) :
  `EMAILS_FILE=./optout.txt OUT_FILE=./export-optout.xlsx npx tsx src/scripts/exportOptoutVolontaires.effect.ts`
- **Variables d'environnement**
  - `EMAILS_FILE` : chemin d'un fichier texte (1 email/ligne) dérivé du xlsx d'entrée.
  - `OUT_FILE` : chemin du .xlsx de sortie.
  - `LIMIT` : n'traiter que les N premiers emails (test).
  - `CONCURRENCY` : parallélisme des lots (défaut 5, aligné sur les scripts existants).
  - `DRY_RUN` : exécute les requêtes et le comptage **sans écrire** le fichier.
- **Mongo prod lecture seule** : `initDB` / `closeDB` (`api/src/mongo`), requêtes `.lean()`
  avec **projection stricte** (uniquement les champs du dico), **aucune écriture** (pas de
  `$set`/`update`/`save`).
- **Écriture Excel en streaming** (`exceljs` `stream.xlsx.WorkbookWriter`) pour éviter l'OOM
  connu (~47k volontaires — cf. incident « Export volontaires OOM » : SheetJS construit tout
  le classeur en mémoire). On ouvre chaque worksheet, on écrit les lignes au fil des lots,
  puis `commit()`.

## 5. Onglets & jointures

Population de base : ensemble **Y** des documents `young` dont `email` ∈ liste (normalisé
minuscule/trim). On collecte les identifiants/refs de Y pour dériver les autres onglets.

| Onglet | Population | Clé de jointure | Champs (dico) |
|---|---|---|---|
| **Young** | `email` ∈ liste | `young.email` | birthdateAt, domains, email, employed, engaged, engagedDescription, engagedStructure, firstName, gender, grade, qpv **+ parent1Email, parent1FirstName, parent2Email, parent2FirstName** |
| **Application** | candidatures des Y | `application.youngId ∈ Y._id` (fallback `youngEmail`) | createdAt, feedBackExperienceFiles, hidden, isJvaMission, missionDepartment, missionDuration, missionName, missionRegion, priority, status, updatedAt, youngBirthdateAt, youngCity, youngCohort, youngDepartment, youngEmail, youngFirstName |
| **MissionEquivalence** | équivalences des Y | `missionEquivalence.youngId ∈ Y._id` | address, city, createdAt, desc, endDate, frequency, missionDuration, sousType, startDate, status, structureName, type, updatedAt, zip **+ youngEmail** |
| **Mission** | missions candidatées (dédup.) | `mission._id ∈ {application.missionId}` | 40 champs (dont `location.lat`, `location.lon` imbriqués ; `jvaRawData` volumineux — cf. §7) **+ youngEmail(s)** |
| **Etablissement** | établissements des Y (dédup.) | `etablissement._id ∈ {young.etablissementId}` | academy, city, department, region, schoolYears, type, zip **+ youngEmail(s)** |
| **Classe** | classes des Y (dédup.) | `classe._id ∈ {young.classeId}` | department, filiere, grade, grades, schoolYear **+ youngEmail(s)** |
| **MissionAPI** | missions JVA liées (dédup., best-effort) | à confirmer : `mission.apiEngagementId` → `missionApi` (cf. §7) | adresse, applicationUrl, city, country, createdAt, departmentCode, departmentName, description, domain, endAt, format, lastSyncAt, location.lat, location.lon, organizationName, places, postalCode, publisherName, publisherUrl, region, remote, startAt, status, structureName, title, updatedAt |

Traçabilité : pour les onglets « dédupliqués » (Mission/Etablissement/Classe/MissionAPI),
`youngEmail` liste le/les email(s) des volontaires rattachés (concaténés) — permet de
remonter au(x) volontaire(s) concerné(s).

## 6. Représentants légaux

Champs schéma `young` (`packages/lib/src/mongoSchema/young.ts`) :
`parent1FirstName` / `parent1Email` et `parent2FirstName` / `parent2Email`.
Exportés en 4 colonnes de l'onglet **Young** (« le ou les » ⇒ 2 représentants max).

## 7. Points à vérifier en implémentation

1. **Join MissionAPI** : confirmer la clé exacte reliant `missionApi` à `mission`
   (candidats : `mission.apiEngagementId` = id de la mission dans l'API Engagement ;
   `mission.jvaMissionId`). Si non fiable → onglet best-effort, possiblement vide.
2. **`mission.jvaRawData`** (`Schema.Types.Mixed`) : potentiellement volumineux →
   sérialiser en JSON avec **plafond de taille** par cellule (Excel limite ~32 767 car.).
3. **Champs imbriqués** `location.lat` / `location.lon` : aplatir via chemin (`get(doc, "location.lat")`).
4. **Champs tableaux/objets** (`domains`, `feedBackExperienceFiles`, `grades`, `actions`,
   `contraintes`…) : sérialiser proprement (JSON ou join `", "`) — décision par type.
5. **Doublons d'email** côté `young` : un même email peut avoir plusieurs docs → l'onglet
   Young peut avoir >48 854 lignes ; c'est voulu (on exporte tous les docs correspondants).
6. **Emails non trouvés** : lister dans le rapport (attendu : certains déjà anonymisés/purgés).

## 8. Robustesse / sécurité / perf

- **Chunking** des 48k emails et des refs pour les requêtes `$in` (paquets ~1000).
- **Projection stricte** : ne lire que les champs exportés (pas de PII hors périmètre).
- **Lecture seule** : aucune mutation ; le script est **relançable / idempotent**.
- **`DRY_RUN` / `LIMIT`** pour valider sur un échantillon avant le run complet.
- **Rapport final** : nb youngs matchés, nb lignes par onglet, liste des emails non trouvés.

## 9. Hors périmètre

- Modèles `area` (référentiel géo, `cityCode`) et `importplandetransport` (niveau cohorte,
  `cohort`) — **exclus** (non rattachables à un young individuel).
- Aucune anonymisation / écriture : ce script **n'exporte que**.

## 10. Prérequis d'exécution

- Accès Mongo prod (lecture seule) configuré comme pour les scripts existants.
- Conversion préalable du xlsx d'emails en fichier texte (1 email/ligne) → `EMAILS_FILE`.
- Node/tsx opérationnels dans `api/` (cf. setup worktree si besoin).
