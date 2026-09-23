# Lot H2 — statuts et consentements du volontaire fixés côté serveur (M41, M44, M45, M49, L24, M50)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `5d8363d91`
(branche `feat/audit-securite-h2-statuts-c72e00`).

## 1. Constat

Le volontaire pouvait écrire lui-même des champs qui relèvent de l'instruction (statut
d'inscription, statut de phase 3, droit à l'image). Et les actions de masse phase 1 ne vérifiaient
que le rôle de l'acteur, pas son rattachement à la session.

| Id | Route | Défaut | Correctif |
| --- | --- | --- | --- |
| M41 | `PUT /young/account/address` | `status` et `cohort` lus dans le body : un jeune en liste complémentaire passait en VALIDATED en déclarant une adresse | champs retirés du schéma, statut recalculé côté serveur |
| M44 | `GET`, `PUT /young/validate_phase3/:young/:token` | le porteur du lien (tuteur externe) recevait le dossier complet : santé, parents, adresse, jetons | vue tuteur minimale |
| M45 | `PUT /young/:id/validate-mission-phase3` | `statusPhase3` accepté du body (auto-validation) ; email du tuteur non validé | statut fixé par le serveur, email validé, mission validée figée |
| M49 | `PUT /young/phase1/imageRight` | le jeune écrivait le drapeau effectif `imageRight`, qui alimente les exports et attestations | le jeune ne dépose que la demande |
| L24 | `PUT /young/change-cohort` | document Mongoose brut renvoyé, avec les jetons du compte | `serializeYoung(young, req.user)` |
| M50 | `POST /young/phase1/multiaction/:key`, `/multiaction/depart` | présence, JDM, fiche sanitaire et départ modifiables sur n'importe quelle session | session rattachée à l'acteur, sinon 403 |

**Constat aggravé sur M45.** Le schéma Joi de `validate-mission-phase3` portait `.unknown()`. Avec
`.unknown()`, l'option `stripUnknown` ne retire rien : tout champ du body arrivait dans
`young.set(...)`. Le jeune pouvait donc écrire **n'importe quel champ de son dossier** (`status`,
`statusPhase1`, `imageRight`…), et pas seulement `statusPhase3`. `.unknown()` est retiré, et un test
le vérifie.

## 2. Correctifs

### M41 — `PUT /young/account/address`

`status` et `cohort` sont retirés du schéma : le body ne les porte plus. Quand le département change
pour un jeune VALIDATED ou WAITING_LIST en attente d'affectation, le serveur recalcule le statut à
partir des séjours éligibles depuis la nouvelle adresse :

- aucun séjour éligible : NOT_ELIGIBLE, comme le front le demandait déjà après confirmation du
  jeune ;
- séjour actuel toujours éligible : la cohorte est conservée. Un jeune VALIDATED passe en
  WAITING_LIST si l'objectif du nouveau département est atteint. Un jeune WAITING_LIST **reste**
  WAITING_LIST : sortir de la liste complémentaire relève de l'instruction ;
- d'autres séjours éligibles, mais pas le séjour actuel : 403. Changer de séjour passe par
  `PUT /young/change-cohort`, qui contrôle lui-même l'éligibilité.

L'éligibilité est calculée avec le statut du dossier (`young.status`). Avant, le statut envoyé par le
client entrait dans `getFilteredSessions` : envoyer WAITING_VALIDATION ouvrait aussi les séjours en
phase d'instruction.

### M44 — `validate_phase3`

Le `GET` et le `PUT` renvoient une projection limitée à ce qu'affiche la page de validation de
l'admin : `_id`, prénom, nom, cohorte, `statusPhase3` et les champs `phase3*` (structure, mission,
dates, tuteur, note). `phase3Token` en est exclu. Le `PUT` n'écrivait déjà que `statusPhase3` (et ses
dates) et `phase3TutorNote`. Son `.unknown()`, inerte mais trompeur, est retiré.

### M45 — `validate-mission-phase3`

- `statusPhase3` est retiré du schéma. La soumission fixe WAITING_VALIDATION côté serveur.
- `phase3TutorEmail` : `.lowercase().trim().email()`. Le champ reste facultatif, comme avant.
- Si la phase 3 est déjà VALIDATED : 403. Le jeune ne peut plus remplacer la mission attestée par
  une autre.
- `.unknown()` est retiré (cf. constat aggravé).

### M49 — `PUT /young/phase1/imageRight`

`validatePhase1Document("imageRight")` n'accepte plus que `imageRightFiles`. Un `imageRight` encore
envoyé est ignoré (`stripUnknown`), pas rejeté. La route écrit les pièces et passe
`imageRightFilesStatus` à WAITING_VERIFICATION. Le drapeau effectif `imageRight` n'est plus écrit
que par un référent : `PUT /young-edition/:id/ref-allow-snu` (`updateYoungConsent`) ou
`PUT /referent/young/:id`. La validation des pièces reste sur `PUT /young-edition/:id/situationparents`
(`imageRightFilesStatus`). Aucun front n'appelle cette route pour le droit à l'image.

### L24 — `PUT /young/change-cohort`

La réponse passe par `serializeYoung(young, req.user)`, comme les autres routes du fichier.

### M50 — multiactions phase 1

Nouveau helper `isSessionPhase1InUserScope(user, sessionPhase1Id)` dans `young/youngScope.ts`. Il
réutilise les règles de périmètre existantes :

- admin : toute session, y compris un lot sans session ;
- chef de centre, adjoint, référent sanitaire : session dont il est responsable
  (`getResponsibleCenterField`, même règle qu'`isYoungInHeadCenterScope`) ;
- référent départemental ou régional : session de son territoire. La requête est commune avec
  `isYoungInReferentTerritory` ; un référent régional sans région est refusé ;
- tout autre rôle : refusé.

Les deux routes appellent ce helper après avoir vérifié que tout le lot partage la même session.
Au passage, sur `/multiaction/depart`, `youngs.some(() => !canEditPresenceYoung(req.user))` devient
un simple `!canEditPresenceYoung(req.user)` (même sémantique).

## 3. Effets visibles côté front

- **Changement d'adresse (app)** : un jeune en liste complémentaire qui déménage dans un département
  où l'objectif n'est pas atteint n'est plus promu en VALIDATED. Le front envoyait VALIDATED dans
  ce cas, le serveur l'ignore désormais.
- **Changement d'adresse vers un autre séjour** : le parcours « choisir un autre séjour » de la
  modale envoie `cohortId` / `cohortName`. L'API ne lisait que `cohort`, donc ce parcours échouait
  déjà en 403 avant ce lot. Le comportement est inchangé.
- **Volontaires CLE** : exclus du recalcul, comme dans la modale (`shouldChangeCohort` teste
  `!isCle`). Leur séjour dépend de la classe, pas de l'adresse. Avant, un volontaire CLE en attente
  d'affectation qui changeait de département recevait en pratique un 403. Désormais son adresse est
  mise à jour, sans changement de statut.
- **Validation phase 3 (admin)** : la page n'utilise que des champs de la projection.
- **Multiactions (admin, centres)** : un chef de centre ou un référent sur une session hors de son
  périmètre reçoit 403.

## 4. Tests

`__tests__/young-statuts-auto-servis.test.ts` : 14 cas. Ils créent les acteurs avec
`createYoungHelper` et `createReferentHelper`, jamais des objets nus, et incluent des contrôles
positifs pour que les refus ne soient pas verts par construction. Sur les sources d'`origin/main`,
12 échouent (tous sauf les 2 contrôles positifs) :

- adresse : `status: VALIDATED` envoyé par un jeune WAITING_LIST → statut inchangé ; aucun séjour
  éligible → NOT_ELIGIBLE ; département inchangé → statut envoyé ignoré ;
- phase 3 : vue tuteur sans PII ; le `PUT` tuteur n'écrit que statut et note ;
  `statusPhase3: VALIDATED` ignoré → WAITING_VALIDATION ; champs hors formulaire ignorés ; email
  tuteur invalide → 400 ; mission validée → 403 ;
- droit à l'image : `imageRight` inchangé, `imageRightFilesStatus` = WAITING_VERIFICATION ;
- multiactions : référent départemental sur une session d'un autre département → 403, sur son
  département → 200 ; chef de centre non responsable → 403 sur le départ, responsable → 200.

`young.test.ts` : les deux cas `validate-mission-phase3` qui utilisaient la fixture par défaut
(phase 3 VALIDATED) passent `statusPhase3: WAITING_REALISATION`.

## 5. Reste à faire

- `phase3Token` n'expire pas et n'est pas invalidé après la validation du tuteur. Le lien reste
  rejouable, mais il n'expose plus que la vue tuteur.
- `PUT /young/phase1/rules` écrit toujours `rulesYoung` sans pièce vérifiée (mentionné dans M49,
  hors du périmètre de ce lot).
- `canEditPresenceYoung` (snu-lib) reste une matrice de rôles. Ses autres appelants, les routes
  unitaires de `controllers/young/phase1.ts`, sont montés sous `/young/:id/phase1` derrière
  `youngPerimeterMiddleware` : le périmètre y est déjà contrôlé au montage.
