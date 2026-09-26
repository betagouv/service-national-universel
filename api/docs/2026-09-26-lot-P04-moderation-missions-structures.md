# Lot P04 — modération des missions et drapeau « préparation militaire » des structures

Audit de sécurité de la production du 25/09/2026, constats PH13, PM13, PM22 et PL1 (ticket Linear
GOO-59). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main` @ `b89d18386`.

## 1. Correctifs

| Constat | Route | Correctif |
| --- | --- | --- |
| PH13 | `PUT /structure/:id` | un responsable ou un superviseur ne change plus `isMilitaryPreparation` (403). Le renvoyer inchangé reste accepté. Administrateur et référents du territoire inchangés |
| PM13 | `PUT /mission/:id` | une mission validée repasse en `WAITING_VALIDATION` dès qu'un responsable ou un superviseur change un champ modéré (`missionRequiresRevalidation`, `missionAccess.ts`) |
| PM22 | `PUT` et `POST /mission`, cron `noticePushMission` | `structureName` vient de la structure porteuse, pas du corps ; nom de mission, structure et adresse sans balisage dans le mail `MISSION_PROPOSITION_AUTO` ; le nom d'une mission validée ne change plus sans modération (PM13) |
| PL1 | `PUT /mission/:id` | réponse passée par `serializeMission` : `jvaRawData` n'est plus renvoyé |

Champs modérés : `name`, `justifications`, `contraintes`, `frequence`, `duration`, `startAt`, `endAt`,
`address`, `zip`, `city`, `department`, `region`, `isMilitaryPreparation`, `hebergement`, en plus de
`description` et `actions` qui déclenchaient déjà la revalidation. Restent modifiables sans
revalidation : places, visibilité, tuteur, statut.

## 2. Choix

- Les dates sont comparées en millisecondes : le corps les porte en chaîne ISO, la base en `Date`.
  Un drapeau absent vaut « false » : renvoyer le formulaire inchangé ne relance pas la modération.
- Le déclencheur ne vise que les rôles non modérateurs et les missions qui resteraient validées. Un
  référent qui corrige une mission de son territoire ne la renvoie pas à lui-même.
- Côté admin, la bascule « Préparation militaire » de la fiche structure reste affichée à tout
  éditeur. Le serveur refuse le changement ; l'écran n'est pas modifié dans ce lot (api seul).

## 3. Impact fonctionnel

Une mission validée dont la structure change le nom, l'adresse, les dates ou la durée disparaît de
l'offre le temps d'être revalidée. Le référent en est prévenu par le mail `NEW_MISSION` habituel. Un
pic de missions à modérer est possible après déploiement.

## 4. Après déploiement

- Lister, dans l'historique des patches des structures, les passages de `isMilitaryPreparation` faits
  par un responsable ou un superviseur, pour revalidation par le référent.
- Optionnel : repérer les missions restées validées après un changement de champ modéré.
