# Lot D : candidatures, changement de statut par lot et notifications (L1, L2)

Date : 2026-09-24 · Audit sécurité des API du 21/09/2026 · Ticket Linear GOO-38 · Branche `fix/goo-38-lot-d-candidatures`, base `origin/main` (`02999e0e0`)

## État des constats sur `origin/main`

- **L1** : à moitié fermé. Depuis #5338, `POST /application/multiaction/change-status/:key` traite déjà les candidatures
  une par une (plus de `Promise.all`). Deux points restaient ouverts :
  - les recalculs (`updateYoungPhase2StatusAndHours`, `updateYoungStatusPhase2Contract`, `updateMission`) avalaient
    leurs erreurs (`try/catch` + `capture`), et le lot répondait 200 avec des heures ou des places faussées ;
  - **constat nouveau**, voisin de FL2 (GOO-12, #5392) : cette route n'appliquait pas `canReferentChangeApplicationStatus`.
    Un responsable ou un superviseur de structure pouvait donc passer par lot une candidature `WAITING_ACCEPTATION`
    (jamais acceptée par le volontaire) à `DONE`. Cette transition valide la phase 2. Le test le reproduit sur
    `origin/main` : 200.
- **L2** : ouvert. `POST /application/:id/notify/:template` acceptait n'importe quel template de la route pour un volontaire
  (« candidature validée » envoyé au tuteur, « refus » avec motif libre envoyé à soi-même et à ses parents…), un `type`
  libre recopié dans l'email, et aucune limite de débit. `POST /application/notify/docs-military-preparation/:template`
  était déjà restreinte à un seul template, mais sans limite de débit.

## Ce qui change

| Id  | Où                                            | Avant                                                                                                      | Après                                                                                                                                                                                                                                                                                                                                           |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | `multiaction/change-status`                   | transitions de statut non contrôlées                                                                       | mêmes transitions par rôle que `PUT /application` (`canReferentChangeApplicationStatus`). Le contrôle porte sur tout le lot avant la moindre écriture : 403 si une seule candidature est refusée                                                                                                                                                |
| L1  | `multiaction/change-status`                   | pour chaque candidature : écriture, puis recalcul du volontaire et de la mission                           | 1) écriture de toutes les candidatures ; 2) **un seul** recalcul par volontaire et un seul par mission ; 3) notifications. Les erreurs de recalcul remontent et donnent un 500 (capturé dans Sentry) au lieu d'être avalées                                                                                                                     |
| L1  | `utils/index.ts`, `applicationService.ts`     | —                                                                                                          | variantes qui lèvent leurs erreurs : `recomputeYoungPhase2StatusAndHours`, `recomputeYoungStatusPhase2Contract`, `recomputeMissionPlaces`. Les fonctions historiques (`update…`) les enveloppent et gardent leur comportement pour les ~10 autres appelants                                                                                     |
| L2  | `/:id/notify/:template`                       | tout template traité par la route, pour tout rôle ; template inconnu → 404 après lecture de la candidature | liste fermée validée par Joi (400) : le volontaire n'a droit qu'aux 5 notifications qu'envoie l'app (nouvelle candidature, abandon, annulation ×2, pièce jointe), et chacune seulement si le statut de sa candidature la justifie (ex. « abandon » seulement sur une candidature `ABANDON`). Les référents gardent les 10 templates de la route |
| L2  | `/:id/notify/:template`                       | `message` et `type` libres                                                                                 | `message` interdit au volontaire (il ne sert qu'au motif de refus, envoyé par un référent) ; `type` limité aux 4 types de pièces jointes de phase 2 ; `multipleDocument` limité à `"true"`/`"false"`                                                                                                                                            |
| L2  | `/:id/notify/:template`                       | pas de limite                                                                                              | 20 notifications par heure et par volontaire (`userRateLimiter`, Redis) → 429. Les référents ne sont pas limités ici, car l'admin envoie en masse                                                                                                                                                                                               |
| L2  | `/notify/docs-military-preparation/:template` | route servie                                                                                               | **supprimée** : aucun appelant dans le dépôt, et le serveur envoie déjà cette notification lui-même au dépôt des pièces (`notifyReferentMilitaryPreparationFilesSubmitted`)                                                                                                                                                                     |

## Vérification (Node 20, en série)

| Contrôle                                                                                                                             | Résultat                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `api` : `application-lot-d` (nouveau)                                                                                                | 10/10 ; sur le code d'`origin/main`, 8 cas échouent (dont la transition `WAITING_ACCEPTATION → DONE` : 200) |
| `api` : suites voisines (application, application-security, mission, mission-security, contract, equivalence ×2, export ES missions) | 9 suites, 208/208 (3 ignorés)                                                                               |

Deux cas passent aussi sur `origin/main`, ce qui est attendu : le lot de 10 candidatures d'un même volontaire donne
des heures justes depuis que #5338 a rendu le traitement séquentiel, et l'annulation légitime reste acceptée. Ils
servent de tests de non-régression.

## Hors périmètre / à surveiller

- L'app (moncompte) enchaîne `PUT /application` puis `notify` même quand le `PUT` échoue. La notification est
  maintenant refusée (400) si le statut ne la justifie pas, ce qui corrige de fait un email envoyé à tort.
- Les notifications restent envoyées par le front, qui fait un appel séparé après le changement de statut.
  Il serait plus sûr que le serveur les envoie lui-même depuis `PUT /application`, comme il le fait déjà pour
  `multiaction`. Ce chantier fonctionnel est distinct.
