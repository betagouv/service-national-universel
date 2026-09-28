# Lot P09 — instruction du dossier volontaire (demande de correction, validation phase 3)

Audit de sécurité de la production du 25/09/2026, constats PH5 et PM19 (ticket Linear GOO-66).
Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main` @ `aa4aa9316`.

Le reste du brouillon initial du lot P09 (PH15, PM35, PM18, PM28, PM29, PL23, PL9) est vidé par le
lot P23 (GOO-65, décommissionnement des écritures phase 1) : ces constats portent sur des clés
retirées de `validateYoung` ou des routes supprimées par ce lot, encore non fusionné.

## 1. Correctifs

| Constat | Route | Correctif |
| --- | --- | --- |
| PH5 | `POST /correction-request/:youngId` | passer un dossier en `WAITING_CORRECTION` n'est plus autorisé, pour un non-ADMIN, que depuis `WAITING_VALIDATION` (ou si le dossier y est déjà) — `canUpdateYoungStatus` (snu-lib) ne vérifiait que la transition de statut elle-même, jamais depuis quel statut de départ |
| PM19 | `PUT /young/:id/validate-mission-phase3` | refus (403) si `phase3TutorEmail` est identique à l'email du volontaire ou à `parent1Email`/`parent2Email` ; limite de 10 soumissions par heure et par compte |

Le hunk touché de `young/index.ts` (`validate-mission-phase3`) est distinct de ceux du lot P23 :
rebase mécanique.

## 2. Choix

- **PH5** : remplacement de `canUpdateYoungStatus({ body, current })` (snu-lib/common.ts, qui ne
  reçoit pas l'acteur et ne bloque que les passages VERS `VALIDATED`/`DONE`) par
  `canReferentChangeYoungStatus(user, young.status, WAITING_CORRECTION)`, déjà exporté par
  `api/src/young/youngStatusTransitions.ts` et utilisé par `PUT /referent/young/:id` (GOO-12).
  L'ADMIN reste sans limite (branche `role === ADMIN` de la fonction). La seconde occurrence de
  `canUpdateYoungStatus` dans ce fichier (`DELETE /:youngId/:field`, transition
  `WAITING_CORRECTION` → `WAITING_VALIDATION` à l'annulation de la dernière demande) est hors
  périmètre du constat et n'a pas été touchée.
- **Piège relevé en écrivant les tests** : `canReferentChangeYoungStatus(user, "WAITING_CORRECTION",
  "WAITING_CORRECTION")` renvoie `false` — la table `YOUNG_STATUS_TRANSITIONS` ne liste aucune
  transition vers soi-même. Or la route est rappelée pour ajouter une correction supplémentaire
  alors que le dossier est déjà en attente de correction (usage normal). Le garde n'est donc évalué
  que si `young.status !== WAITING_CORRECTION`, à l'image du `isChanged()` déjà utilisé par
  `canReferentApplyYoungUpdate` pour le même genre de no-op.
- **PM19** : comparaison insensible à la casse (`phase3TutorEmail` est déjà normalisé en minuscules
  par le schéma Joi ; les emails en base ne le sont pas forcément). Le contrôle porte sur les trois
  adresses connues du dossier (volontaire + deux parents) ; il n'empêche pas de désigner un tiers
  qui serait de fait un proche non déclaré — hors portée d'un contrôle serveur.
- Limiteur : `userRateLimiter` (déjà présent dans `middlewares/rateLimit.ts`, jusqu'ici sans
  appelant), clé par compte volontaire, 10 requêtes/heure — même ordre de grandeur que les autres
  limiteurs par compte du dépôt (ex. `referentInviteLimiter`, 30/heure). Posé uniquement sur
  `PUT /:id/validate-mission-phase3` (soumission par le volontaire, authentifiée) ; la route de
  validation par le tuteur (`PUT /young/validate_phase3/:young/:token`, à jeton, sans session) n'est
  pas concernée par ce lot.
- Décision produit non tranchée (signalée par l'audit, hors correctif) : si la phase 3 n'est plus
  proposée, les deux routes `validate-mission-phase3` / `validate_phase3` pourraient être
  supprimées plutôt que corrigées. Les deux sont encore appelées (app `/phase3/valider`, lien envoyé
  au tuteur) : aucune suppression n'a été faite dans ce lot.

## 3. Impact fonctionnel

- Un référent qui tentait une demande de correction sur un dossier déjà validé, refusé, désisté ou
  abandonné recevait jusqu'ici un succès silencieux (statut basculé à tort). Il reçoit maintenant un
  403 ; l'ADMIN n'est pas concerné. Aucun impact sur le parcours normal (dossier en attente de
  validation, ou déjà en attente de correction).
- Un volontaire qui indiquait sa propre adresse (ou celle d'un parent déclaré) comme tuteur de
  mission recevait jusqu'ici une auto-validation possible ; il reçoit désormais un 403 à la
  soumission. Un volontaire soumettant plus de 10 fois par heure (relances, corrections de
  brouillon) reçoit un 429 au-delà — plafond large au regard de l'usage attendu (une soumission par
  mission).

## 4. Après déploiement

- Aucune action corrective sur les données : PH5 et PM19 ne portent que sur le contrôle d'écriture,
  pas sur des documents déjà en base à corriger.
- Si une décision produit ferme la phase 3, prévoir une PR de suppression des deux routes
  (`validate-mission-phase3`, `validate_phase3/:young/:token`) et de leurs appelants front — non
  traité ici.
