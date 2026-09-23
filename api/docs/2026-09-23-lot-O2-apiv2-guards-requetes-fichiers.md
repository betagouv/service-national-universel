# Lot O2 — apiv2 : guards, validation des requêtes et fichiers (M75, M77, M78, L39, L40, L43)

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-29 · Branche `fix/goo-29-lot-o2-apiv2`, base `origin/main` (`a363ed644`)

## État des constats sur `origin/main`

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| M78 | `POST /v2/affectation/:sessionId/simulation/hts-dromcom` porte `@UseGuards(AdminGuard)` (#5375, GOO-12) | — |
| L43 | export « scolarisés » : `if (!isExportScolariseAllowed(...)) throw` (#5311 / #5375) | — |
| M75 | route derrière le feature flag `INSCRIPTION_EN_MASSE_CLASSE` et retirée de l'admin (#5375, FM10) | `/importer` accepte n'importe quelle `fileKey` existante, ne rejoue aucune règle, rejouable N fois |
| M77 | — | `name`, `status`, `type`, `sort`, `limit` des listings de tâches non validés |
| L39 | — | `filters` des exports missions / candidatures spreadés dans la requête ES ; terme de recherche injecté tel quel dans un `wildcard` ; exports en attente non bornés |
| L40 | — | `FileInterceptor` sans limite de taille (stockage mémoire multer), type pris du `mimetype` client |

Nuance sur M77 : apiv2 tourne sur Express 5, dont le parseur de query par défaut est « simple ».
`?status[$ne]=x` y arrive sous la clé littérale `status[$ne]`, pas comme un opérateur Mongo :
l'injection d'opérateur n'est pas exploitable aujourd'hui. Le nom de tâche, lui, était libre
(`?name=JEUNE_EXPORT` listait les exports de jeunes et leurs paramètres depuis l'écran des imports).

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M77 | `GET /v2/referentiel/import` | paramètres libres | DTO `GetImportsQueryDto` : `name` ∈ tâches du référentiel, `type` ∈ `ReferentielTaskType`, `status` ∈ `TaskStatus`, `sort` ∈ ASC/DESC, `limit` entier 1-100 ; clé hors DTO → 400 (`StrictQueryPipe`) |
| M77 | `GET /v2/phase1/:sessionId/simulations`, `/traitements` | `name` et `status` libres | `name` borné à la famille listée (simulations ou traitements), `status` ∈ `TaskStatus` ; clé hors DTO → 400 |
| M75 | `POST /v2/classe/:id/inscription-en-masse/importer` | toute `fileKey` existante | la clé doit être dans le dossier S3 de la classe (`file/admin/sejours/cle/classe/<id>/inscription-en-masse/`, sans `..`) ; une clé déjà importée est refusée (usage unique) |
| M75 | tâche `IMPORT_CLASSE_EN_MASSE` | import direct du fichier | la validation (`ValidationInscriptionEnMasseClasse.validerFichier` : classe ouverte, capacité, format, UAI, doublons, jeunes déjà inscrits) est rejouée sur le fichier ; au moindre écart, rien n'est importé |
| L39 | `POST /v2/mission/export`, `/mission/candidatures/export` | `filters` : objet libre | clés limitées aux filtres de la liste des missions de l'admin (`MISSION_EXPORT_FILTER_KEYS`), valeurs chaîne ou liste de chaînes ; sinon 400. Au plus 3 exports non terminés par utilisateur sur 24 h (422 `TOO_MANY_PENDING_EXPORTS`) |
| L39 | tâches d'export missions / candidatures | filtres relus tels quels | seules les clés autorisées sont relues (couvre les tâches déjà en file) |
| L39 | `ElasticsearchQueryBuilder.setSearchTerm` (toutes les recherches apiv2) | `*` et `?` du terme saisi interprétés | échappés : la recherche reste préfixe / suffixe littérale |
| L40 | `POST /v2/referentiel/import/:name`, `POST /v2/classe/:id/inscription-en-masse/valider` | taille illimitée en mémoire, type déclaré par le client | 20 Mo maximum, un fichier ; contenu vérifié (signature ZIP pour un xlsx, pas d'octet nul pour un CSV) ; sinon 422 `INVALID_FILE_FORMAT` (413 au-delà de la taille) |

Pour la liste des exports, une clé inconnue est **refusée** à la création et non ignorée : l'ignorer
élargirait silencieusement l'export.

## Démonstration

- `apiv2/test/admin/referentiel/ImportReferentielController.spec.ts` — opérateur dans `status` /
  `type`, clé répétée, nom de tâche hors référentiel, `limit` hors bornes → 400 ; requête du front
  acceptée, filtre vide traité comme absent ; faux xlsx et fichier vide → 422.
- `apiv2/test/admin/sejour/phase1/Phase1.controller.query.spec.ts` — nom hors famille, nom de
  simulation sur les traitements, opérateur, clé répétée, statut inconnu → 400 ; requêtes du front → 200.
- `apiv2/src/admin/core/sejours/cle/classe/importEnMasse/ClasseImportEnMasse.service.spec.ts` —
  fichier d'une autre classe, clé arbitraire, traversée `..`, fichier déjà importé → refusés.
- `.../useCase/ImporterClasseEnMasse.spec.ts` — validation rejouée à l'exécution : erreurs ou
  classe fermée entre-temps → aucun jeune créé.
- `apiv2/test/admin/engagement/Mission.controller.export.spec.ts` et
  `apiv2/src/admin/core/engagement/mission/ExportMission.service.filtres.spec.ts` — clés et valeurs
  refusées, borne des exports en attente, structure imposée au responsable.
- `apiv2/src/shared/infra/UploadFile.spec.ts`, `apiv2/src/analytics/infra/ElasticQuery.builder.spec.ts`.

Suite apiv2 complète en local : 558 tests passent, 0 en échec. 26 suites ne se chargent pas, pour
des raisons d'environnement déjà présentes avant ce lot (`@bull-board/nestjs` absent, `mongoose`
indéfini).

## Hors périmètre / à surveiller

- Tout nouveau filtre de la liste des missions de l'admin (`admin/src/scenes/missions/list.tsx`)
  doit être reporté dans `MISSION_EXPORT_FILTER_KEYS`, sinon l'export répondra 400.
- La vérification d'usage unique de l'import CLE n'est pas atomique : deux appels simultanés sur la
  même clé peuvent créer deux tâches. La route est derrière un feature flag désactivé et retirée de
  l'admin. Un index unique sur `metadata.parameters.fileKey` fermerait ce cas.
- `/importer` vérifie encore l'existence de la clé S3 (`remoteFileExists`) avant le contrôle de
  rattachement à la classe : c'est un oracle d'existence de clé, réservé aux administrateurs CLE de la classe.
- À vérifier : `searchMissions` n'impose un périmètre qu'aux responsables et superviseurs. Pour un
  référent départemental ou régional, le département de l'export des missions (hors candidatures)
  vient du filtre par défaut du front.
