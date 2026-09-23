# GOO-12 — autorisations appliquées seulement dans les interfaces (FH8, FH4, FM1, FM10, FM13, FM18)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`68e7252c4`)

Chaque constat a été relu sur le code courant avant correction. L'admin (ou l'app volontaire pour FM1)
masquait l'action ; l'API l'acceptait. Les correctifs ci-dessous alignent l'API sur ce que l'interface
propose déjà : aucun parcours utilisé aujourd'hui ne change.

## Ce qui change

| Constat | Où | Avant | Après |
|---|---|---|---|
| FH8 | `api` `POST /elasticsearch/young/*` (`buildYoungContext`) | le rôle `visitor` recevait un filtre régional et exportait les dossiers complets des volontaires de sa région | `visitor` retiré des rôles admis : 403 sur `search`, `export`, `in-bus`, `by-point-de-rassemblement`, `propose-mission`. L'admin ne lui ouvre que le tableau de bord et l'annuaire des établissements, qui n'appellent aucune de ces routes |
| FH4 | `api` `POST /elasticsearch/cle/classe/export` | export national des classes avec contacts des référents, chefs d'établissement et coordinateurs ouvert au transporteur, à l'administrateur CLE et au référent de classe ; contrôles transporteur faits après les lectures | export réservé à ADMIN, REFERENT_REGION, REFERENT_DEPARTMENT (les seuls à qui l'admin propose le bouton) ; `schema-de-repartition` réservé à ADMIN et REFERENT_REGION ; refus avant toute lecture. La recherche reste ouverte aux mêmes rôles qu'avant |
| FM1 | `api` `PUT /young/:id/phase2/militaryPreparation/status` | le volontaire pouvait passer son propre dossier en `VALIDATED` | le volontaire ne peut que déposer (`WAITING_VERIFICATION`) ; `VALIDATED`, `REFUSED` et `WAITING_CORRECTION` exigent `canViewYoungMilitaryPreparationFile` (admin, référent du territoire) |
| FM10 | `apiv2` `POST /classe/:id/inscription-en-masse/importer`, `POST /classe/:id/inscription-manuelle` | seule la validation du fichier vérifiait le feature flag `INSCRIPTION_EN_MASSE_CLASSE` | les trois routes d'inscription d'élèves vérifient le flag (`FEATURE_FLAG_NOT_ENABLED`, 422) |
| FM13 (volet historique) | `api` `PUT /referent/young/:id` | `historic` accepté tel quel du client : réécriture ou effacement du parcours, décision attribuée à un autre | `historic` retiré de `validateYoung` ; l'entrée est ajoutée côté serveur à chaque changement de `status`, au nom de l'utilisateur authentifié (motif de désistement en note, comme avant). L'admin n'envoie plus le tableau |
| FM18 | `apiv2` validations d'affectation (HTS, HTS DROM-COM, CLE, CLE DROM-COM), de désistement et de bascule (valides, non valides) | `AdminGuard` : tout ADMIN | `SuperAdminGuard`, comme dans l'admin. L'onglet « Opérations » n'est d'ailleurs plus affiché |
| FM18 (constat voisin) | `apiv2` `POST /affectation/:sessionId/simulation/hts-dromcom` | aucune garde de rôle : tout référent authentifié lançait une simulation | `AdminGuard`, comme les autres simulations |

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `api` — `elasticsearch-scope`, `young-security`, `referent-young-security` (ts-jest complet) | 3 suites, 79/79 |
| `api` — `referent`, `elasticsearch-perimeter`, `cle-classe-security`, `young-patches-security`, `cle-perimetre-security`, `cle-routes-supprimees` | 6 suites, 148/148 |
| `api` — `tsc -p tsconfig.build.json --noEmit` | 0 erreur |
| `apiv2` — `OperationsDeMasse.guards.spec`, `test/admin/sejour/cle/classe/Classe.controller.spec` | 16/16 |

## Restant sur GOO-12

- FM13 : bornage par rôle du statut, de la cohorte et de l'affectation sur `PUT /referent/young/:id`.
- FL2 : règles de transition de statut (phase 2, désistement, candidatures) appliquées côté API.
- `YoungFooterNoRequest.tsx` : compter la liste d'attente sans télécharger les hits.

## Points d'attention

- L'entrée d'historique porte la phase courante du volontaire (`young.phase`) et non plus l'onglet de l'admin
  depuis lequel le statut a été changé.
- Les changements de statut faits par `selectStatus` (listes de l'admin) n'étaient pas tracés, le tableau
  n'étant pas envoyé ; ils le sont désormais pour `status`.
