# GOO-12 (suite) — statuts, cohorte et affectation bornés par rôle côté API (FM13, FL2)

Date : 2026-09-24 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`b6a609990`) · Fait suite à #5375

Chaque constat a été relu sur le code courant avant correction. Les règles existaient dans l'admin
(`YoungHeader.jsx`, `selectStatus.jsx`, `selectStatusApplication.jsx`, `SelectStatusApplicationPhase2.jsx`) ;
l'API acceptait tout ce qu'on lui envoyait. Les matrices appliquées côté serveur reprennent l'union de ce que
ces écrans proposent : aucune action offerte par l'interface n'est refusée.

## Ce qui change

| Constat | Où | Avant | Après |
|---|---|---|---|
| FM13 (statut) | `api` `PUT /referent/young/:id` | tout statut accepté (`ABANDONED`, `NOT_AUTORISED`, `DELETED`…), hors effets de bord des parcours dédiés | hors ADMIN : transitions de l'instruction seulement (`WAITING_VALIDATION`/`WAITING_CORRECTION` → validé, refusé, correction, liste complémentaire ; liste complémentaire → validé) et désistement depuis tout statut actif. 403 sinon |
| FM13 (cohorte) | idem | `cohort`, `cohortId`, `originalCohort` modifiables, sans l'éligibilité, les places ni la notification de `/change-cohort` | hors ADMIN : 403 si l'une de ces valeurs change ; le changement passe par `/change-cohort` |
| FM13 (affectation) | idem | `sessionPhase1Id`, `cohesionCenterId`, `meetingPointId` modifiables sans décompte des places (et une session d'un autre territoire étendait le périmètre de lecture) | hors ADMIN : 403 si l'une de ces valeurs change |
| FM13 (phase 1) | idem | `statusPhase1` libre | hors ADMIN : non modifiable (il reste calculé par le serveur à partir de la présence) |
| FL2 (désistement) | idem | un référent réactivait un volontaire désisté | réactivation réservée à l'ADMIN, comme dans l'admin |
| FL2 (phase 2) | idem | `statusPhase2` modifiable sur une cohorte totalement archivée ; `canReferentUpdatePhase2Status` n'était appelé nulle part côté API | hors ADMIN : référent régional/départemental seulement, et `canReferentUpdatePhase2Status(cohorte)` vérifié. `statusPhase3` : référents territoriaux seulement |
| FL2 (candidatures) | `api` `PUT /application` | statut libre pour tout référent : un responsable passait une candidature non acceptée par le volontaire à `DONE`, ce qui validait sa phase 2 | responsable / superviseur : matrice de l'admin (ex. `WAITING_ACCEPTATION` → `REFUSED` seulement) ; référent territorial : `canReferentUpdateApplicationStatus(cohorte)` ; autres rôles hors ADMIN : aucun changement de statut |
| — | `admin` `YoungFooterNoRequest.tsx`, `api` `joiElasticSearch` | le comptage de la liste complémentaire téléchargeait une page de dossiers de volontaires | `size: 0` accepté par `joiElasticSearch` (en plus de 10 à 100) : la requête ne renvoie que le total |

Un champ n'est considéré comme modifié que s'il est présent **et** différent de la valeur en base : un client
qui renvoie le dossier complet à l'identique n'est pas refusé.

Les règles sont regroupées dans `api/src/young/youngStatusTransitions.ts` (`canReferentApplyYoungUpdate`,
`canReferentChangeYoungStatus`, `canReferentChangeApplicationStatus`).

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `api` — `referent-young-security`, `referent`, `young-restricted-fields`, `referent-young-file-security` | 4 suites, 114/114 |
| `api` — `referent-young-security`, `application` sans le correctif (contre-épreuve) | 6 nouveaux tests en échec, comme attendu |
| `api` — `elasticsearch-scope`, `elasticsearch-lot-l4`, `elasticsearch-perimeter` | 3 suites, 92/92 |
| `tsc` ciblé sur les fichiers modifiés | 0 erreur hors environnement |

## Points d'attention

- Le test « objectif départemental atteint » de `referent.test.ts` validait un dossier `REFUSED` avec un
  référent départemental : transition que l'admin ne propose pas. La fixture part désormais de `WAITING_VALIDATION`.
- Un responsable de structure ne peut plus remettre une candidature en attente ni l'annuler (`CANCEL`) : l'admin
  ne le lui proposait pas non plus.
- Les matrices de l'admin restent dupliquées côté front ; les porter dans `snu-lib` pour un partage réel est
  un chantier distinct.
