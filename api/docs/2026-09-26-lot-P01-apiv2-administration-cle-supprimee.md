# Lot P01 — apiv2 : suppression de l'administration CLE (PC1, PH23, PM38, PL11)

Date : 2026-09-26 · Audit sécurité de la production du 25/09/2026 · Ticket Linear GOO-55 · base `origin/main` (`b89d18386`)

## État des constats sur `origin/main`

Les quatre constats ont été relus sur le code courant avant correction ; tous étaient encore ouverts.

| Id   | Route                                              | Défaut                                                                                                                                                                                                                              |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PC1  | `POST /v2/classe/:id/referent/modifier-ou-creer`   | le corps brut était étalé en dernier dans le référent créé (`...referent` après `role`, `region`) : un référent territorial pouvait forger un compte de n'importe quel rôle, ADMIN compris, puis l'activer par l'invitation envoyée |
| PH23 | `GET /v2/referent`                                 | annuaire des référents de classe d'un établissement ; `etablissementId` répété devenait un `$in` et contournait le contrôle de périmètre                                                                                            |
| PM38 | `POST /v2/classe/:id/inscription-manuelle`         | inscription d'un élève sans contrôle du statut de la classe, ouverte à l'administrateur CLE                                                                                                                                         |
| PL11 | `POST /v2/classe/:id/verify` et les deux ci-dessus | administration CLE encore exposée malgré le décommissionnement                                                                                                                                                                      |

## Ce qui change

Les inscriptions sont fermées et CLE est en consultation seule : les routes sont **supprimées**, pas rustinées. Les
contrôleurs `ClasseController` et `ReferentController` d'apiv2 n'avaient que ces routes ; ils disparaissent en entier.
Les quatre routes répondent 404 et aucun rôle ne retombe dans un cas par défaut.

Supprimés avec eux, faute d'autre appelant :

- cas d'usage `VerifierClasse`, `ModifierReferentClasse`, `InscrireEleveManuellement`, `InviterReferentClasse`,
  `GetReferentDepToBeNotified` (et `ReferentToBeNotifiedModel`) ;
- dans `ReferentService` : `createNewReferentAndAssignToClasse` (le vecteur de PC1), `deleteReferentAndSendEmail`,
  `isReferentClasseInEtablissement`, `findByRoleAndEtablissement` ; seul `findByEmail` reste ;
- guards `ClasseAdminCleGuard`, `AdminCleGuard`, `ResponsableDeCentreGuard` ;
- DTO `ModifierReferentPayloadDto`, `InscriptionManuellePayloadDto`, `ReferentByRoleQueryDto` ;
- gabarits Brevo `INVITER_REFERENT_CLASSE_TO_INSCRIPTION`, `INVITER_REFERENT_CLASSE_TO_CONFIRMATION`,
  `SUPPRIMER_REFERENT_CLASSE` et leur mapping.

Hors lot, laissés pour P25/P26 : les types de routes de snu-lib (`ClassesRoutes["ModifierReferentClasse"]`,
`["InscriptionManuelle"]`, `ReferentRoutes`), la page admin d'inscription manuelle (derrière le drapeau
`INSCRIPTION_EN_MASSE_CLASSE`), les gabarits `VERIFIER_CLASSE_*` devenus inutilisés et
`ReferentGateway.findByRoleAndEtablissement`.

## Démonstration

`apiv2/test/admin/AdminRoutes.spec.ts` lit les routes réellement montées par `AdminModule` (métadonnées Nest) et
vérifie qu'aucune des quatre routes n'est exposée, ni aucune autre sous `classe/` et `referent`. Sur le code
d'`origin/main`, les cinq cas échouent.

## Vérification (Node 20, en série)

| Contrôle                 | Résultat                                  |
| ------------------------ | ----------------------------------------- |
| `apiv2` — suite complète | 81 suites, 603 réussis, 1 ignoré, 0 échec |

`Phase1EcrituresSupprimees.spec.ts` vérifiait que `inscription-manuelle` restait routée (témoin du lot phase 1) ; il
attend désormais 404.

## Après déploiement (apiv2 seul, sans ordre avec les autres applications)

- 404 sur `POST /v2/classe/:id/verify`, `/referent/modifier-ou-creer`, `/inscription-manuelle` et `GET /v2/referent`.
- Rechercher les comptes éventuellement forgés par PC1 : rôle privilégié avec `metadata: {}` ou référent présent dans
  `classe.referentClasseIds`, créé depuis le 04/08/2025, auteur tiré de `referentpatches`.
- Si le drapeau `INSCRIPTION_EN_MASSE_CLASSE` est actif en production, la page admin d'inscription manuelle répond en
  erreur jusqu'à P26.
