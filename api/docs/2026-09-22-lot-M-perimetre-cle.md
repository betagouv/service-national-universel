# Lot « périmètre CLE » — vérification, démonstration, correctifs

Audit du 21/09/2026. Vérifié sur `origin/main` (`b5ff699ce`, puis rebasé sur `17dd49405`),
après #5315 (décommissionnement de l'administration CLE) et #5336 (C1).

Commit : `25ff87c73` — branche `feat/audit-securite-api-cle-3d5caf`.
Démonstration : `api/src/__tests__/cle-perimetre-security.test.ts` (20 tests, 10 rouges avant correctif).

---

## Verdicts

| Id | Route | Constat de l'audit | Ce que dit le code | Verdict |
|----|-------|--------------------|--------------------|---------|
| H9 | `POST /cle/classe/export?type=export-des-classes` | « les chefs d'établissement partent encore bruts (tokens d'invitation, de reset, 2FA) » | **inexact.** `findChefEtablissementInfoForClasses` mappait par `serializeReferent`, qui supprime `password`, `token2FA`, `forgotPasswordResetToken`, `invitationToken` et leurs dates. | **sur-exposition de PII, pas de secret.** Sévérité à ramener de haute à moyenne. |
| H14 | `GET /cle/etablissement/:id` | aucun périmètre | **confirmé.** `canViewEtablissement` ne porte que la matrice des rôles ; `isEtablissementInUserScope`, disponible dans le même dossier depuis #5336, n'était pas appelé. | **ouvert** |
| H18 | `POST /cle/referent/getMany` | documents référents bruts | **confirmé.** `ReferentModel.find({_id: {$in}})` sans projection, renvoyé tel quel. Seul `password` est `select: false` dans le schéma. | **ouvert — fuite de jetons** |
| M7 | `GET /cle/classe/:id` | aucun périmètre | **confirmé.** | **ouvert** |
| M8 | `GET /cle/classe/:id/patches` | « même liste de rôles, aucun périmètre » | **confirmé, mais pas pour les rôles annoncés.** | **ouvert pour ADMIN, réf. dép./rég. et TRANSPORTER** |
| M9 | `GET /cle/young/by-classe-historic/:idClasse/patches` (+ `/old-student`) | « pour tout rôle porteur de PATCH READ » | **confirmé**, avec la même correction de population de rôles. | **ouvert** |
| L4 | `GET /cle/classe/public/:id` | fermée dans les faits | **confirmé.** Projection publique minimale (`firstName`, `lastName`, dates de cohorte, nom et année scolaire). | **fermée** — test de régression ajouté |
| — | `GET /cle/young/by-classe-stats/:idClasse` | *absente de l'audit* | relevée pendant la vérification : cloisonnait le référent de classe et l'administrateur CLE, mais pas le territoire des référents dép./rég. | **était ouverte**, corrigée avec le lot |

---

## Les deux corrections au rapport d'audit

### H9 — ce n'étaient pas des jetons

Clés réellement renvoyées pour un chef d'établissement, relevées sur la réponse HTTP avant correctif :

```
_id, acceptCGU, cohortIds, cohorts, createdAt, department, email, firstName,
fullName, id, lastLoginAt, lastName, metadata, mobile, phone, region, role,
roles, status, subRole, updatedAt
```

Aucun `invitationToken`, `forgotPasswordResetToken` ni `token2FA` : `serializeReferent`
(`api/src/utils/serializer.js:72`) les supprime. Le problème réel est que l'export n'utilise que
`_id`, `firstName`, `lastName`, `phone` et `email` (`admin/src/scenes/classe/utils/index.ts:262-267`)
et en reçoit vingt et un.

Une liste de suppressions reste le mauvais outil : elle laisse passer par défaut tout champ ajouté
plus tard au schéma. D'où le passage à une projection explicite.

### M8 / M9 — la population de rôles a changé sous l'audit

`PATCHES_READ` est seedée **sans policy** par
`api/migrations/20250801060707-916-permissions-supervisor.js:39-45` pour :

```
ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, TRANSPORTER, ADMINISTRATEUR_CLE, REFERENT_CLASSE
```

`api/migrations/20260922070805-decommissionnement-cle-permissions-et-comptes.js` (#5315) en a retiré
`ADMINISTRATEUR_CLE` et `REFERENT_CLASSE`. Conséquences sur le code tel qu'il était :

- **M8** : les rôles CLE listés dans `accessControlMiddleware` passaient le portail des rôles, puis
  `patches.get` lançait `OPERATION_UNAUTHORIZED`, attrapé en **500**. La route n'était donc pas
  exploitable par eux, mais l'était sans aucun périmètre par les référents départementaux et
  régionaux — hors de leur territoire.
- **M9** : gardée par la seule permission. **TRANSPORTER** y accédait, pour n'importe quelle classe :
  identité et statuts de tous les élèves. Ce rôle n'était pas dans l'inventaire de l'audit.

Ce point est un piège de vérification : un test écrit sans seeder `PATCHES_READ` est **vert par
construction** (la base de test n'a aucune permission, donc tout renvoie 403). La démonstration
seede la liste complète d'origine, rôles CLE compris, pour que le cloisonnement soit prouvé
indépendamment de la liste de rôles du jour.

---

## Correctifs

### 1. Projection — `api/src/cle/referentProjection.ts` (nouveau)

```ts
export const REFERENT_CLE_PUBLIC_FIELDS = "_id firstName lastName email phone role subRole status";
```

Extrait de `classeController.ts` (où il était local sous le nom `REFERENT_CLASSE_PUBLIC_FIELDS`) et
appliqué aux trois sorties de référents du dossier CLE :

| Appelant | Avant | Après |
|---|---|---|
| `getReferentsByIds` (H18) | document brut | `.select(REFERENT_CLE_PUBLIC_FIELDS)` |
| `findChefEtablissementInfoForClasses` (H9) | `serializeReferent` | `.select(REFERENT_CLE_PUBLIC_FIELDS)` |
| `POST /export`, `from-etablissement` | déjà projetés (#5336) | constante partagée |

`subRole` a été ajouté à la projection : le front s'en sert pour trier les destinataires Brevo
(`isChefEtablissement` / `isCoordinateurEtablissement`, `admin/src/hooks/useBrevoRecipients.ts:407-424`).

### 2. Périmètre — `api/src/cle/classe/classeScope.ts` (nouveau)

```ts
isClasseInUserScope(user, classe)
  ADMIN            → true
  REFERENT_CLASSE  → classe.referentClasseIds.includes(user._id)
  autres           → isEtablissementInUserScope(user, classe.etablissementId)
```

Ce découpage n'est pas une invention : il **reprend exactement** les filtres de contexte de la
recherche ES des classes (`api/src/controllers/elasticsearch/cle/classe.js:113-131`), qui cloisonne
déjà le référent de classe sur ses classes, l'administrateur CLE sur son établissement, et les
référents départementaux et régionaux sur les établissements de leur territoire. La liste et la
fiche disent donc désormais la même chose — aucune navigation légitime ne casse.

Le défaut est fermé : un rôle non énuméré (TRANSPORTER, chefs de centre, référent sanitaire…) est
refusé.

Appliqué à :

- `GET /cle/etablissement/:id` → `isEtablissementInUserScope` (H14), avant la lecture, pour ne pas
  offrir d'oracle d'existence.
- `GET /cle/classe/:id` (M7) — et 404 explicite au lieu d'un `200 { data: undefined }`.
- `GET /cle/classe/:id/patches` (M8), avec réutilisation du document déjà chargé (`patches.get(req, ClasseModel, classe)`).
- `GET /cle/young/by-classe-historic/:idClasse/patches` et `/old-student` (M9).
- `GET /cle/young/by-classe-stats/:idClasse` (hors audit), où il **remplace** les deux contrôles
  en place — référent de classe et administrateur CLE — qui laissaient passer les référents
  départementaux et régionaux hors territoire. Cette route alimente la **même page** que
  `GET /cle/classe/:id` (`admin/src/scenes/classe/view/index.tsx:24`) : les deux périmètres
  devaient coïncider, sinon la fiche se charge à moitié.

### 3. L4 — rien à faire

Test de régression seulement.

---

## Démonstration

`api/src/__tests__/cle-perimetre-security.test.ts` — 20 tests.

Avant correctif : **9 rouges**. Extraits :

```
H18 — invitationToken : Received value: "TOKEN-INVITATION-VICTIME"
H14 — administrateur CLE d'un autre établissement : 200 (attendu 403)
M7  — administrateur CLE d'un autre établissement : 200 (attendu 403)
H9  — 14 clés de trop par rapport à la projection
```

Le trou de `by-classe-stats`, relevé après coup, a été démontré de la même façon :
`référent départemental d'un autre département: 200` / `référent régional d'une autre région: 200`
là où les quatre autres acteurs étaient déjà refusés.

Après correctif : **20 verts**.

Chaque route est attaquée par six acteurs hors périmètre, comparés en une fois (administrateur CLE
et coordinateur d'un autre établissement, référent d'une classe d'un autre établissement, référent
départemental et régional d'un autre territoire, transporteur), et doublée de tests d'accès
légitime pour que le cloisonnement ne soit pas obtenu en cassant la fonctionnalité.

Non-régression : `cle-classe-security`, `cle-routes-supprimees`, `young-patches-security`,
`elasticsearch-scope`, `referent` — verts. (`referent.test.ts` a un `beforeAll` à 5 s qui
expire selon la charge machine ; le même échec se reproduit sur l'arbre vierge.)

---

## Restes, hors périmètre de ce lot

1. **`GET /cle/classe/:id/patches` renvoie 500** à un administrateur CLE ou un référent de classe
   pourtant dans le périmètre, depuis que #5315 leur a retiré `PATCHES_READ` : le middleware de rôles
   les laisse entrer, `patches.get` refuse. Bug de confort, pas de sécurité.
2. **`api/src/__tests__/phase1/cle/*.test.ts`** couvre ces routes mais **n'est jamais exécuté** :
   `jest.config.js` ignore `/phase1/`. Tout test ajouté là est vert par construction.
3. **`from-etablissement`** n'est plus appelée par aucun front.
