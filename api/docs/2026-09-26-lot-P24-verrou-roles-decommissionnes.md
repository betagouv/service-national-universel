# Lot P24 — verrou des rôles décommissionnés (création, invitation, activation, session)

Audit de sécurité de la production du 25/09/2026, constats PH2, PH6, PH8 (élevée), PM1, PM8, PM27
(moyenne) et PL2 (faible) (ticket Linear GOO-56). Vérifiés ouverts puis corrigés le 2026-09-26 sur
`origin/main`.

Rôles décommissionnés (décision du 25/09/2026, VISITOR ajouté après l'arbitrage) : `HEAD_CENTER`,
`HEAD_CENTER_ADJOINT`, `REFERENT_CLASSE`, `ADMINISTRATEUR_CLE`, `REFERENT_SANITAIRE`, `TRANSPORTER`,
`VISITOR`. `DSNJ` et `INJEP` sont explicitement conservés.

## 1. Correctifs

| Constat | Surface | Correctif |
| --- | --- | --- |
| PH2, PH8 | `POST /referent/signup_invite/:template` | plus aucune création sur un rôle décommissionné, quel que soit l'acteur (admin compris) — remplace et étend le verrou CLE existant (H17) |
| PH6, PM8 | idem | ferme la création de `TRANSPORTER` par un référent régional (matrice `canInviteUser`) |
| PM27 | `POST /referent/signup_invite/:template` | `structureName` de l'email officiel vient de la structure en base, plus du corps de la requête ; `fromName`/`toName` assainis (`sanitizeEmailText`) ; quota par compte appelant (30/h) |
| — | `POST /referent/signup_invite` (activation par jeton) | refuse l'activation d'un compte au rôle décommissionné (superset du verrou CLE H17) |
| — | `PUT /referent/:id` (`canUpdateReferent`, snu-lib) | ni attribution d'un rôle décommissionné, ni réactivation (`INACTIVE` → autre) d'un compte déjà sur l'un de ces rôles, admin compris |
| — | `passport.validateUser` (api) | rejette la session d'un compte au rôle décommissionné, même sur un JWT encore valide et un statut resté `ACTIVE` |
| — | `POST /referent/signin`, `/signin-2fa`, `/forgot_password` (api) | refusent respectivement la connexion, la validation du code 2FA et l'émission d'un jeton de réinitialisation ; la branche `VERIFICATION_REQUIRED` (CLE, H62) est supprimée avec le reste du verrou |
| PL2 | `GET /signin/token` (session KB, api v1) | `isRevoked` teste désormais aussi `status === INACTIVE` et le rôle décommissionné, pas seulement compte supprimé/anonymisé |
| — | `estSessionValide` (apiv2) | même verrou côté `/v2`, indépendant de l'api v1 |

Toutes les vérifications testent `role` **et** `roles[]` (`isDecommissionedRole`, snu-lib) : `getAcl`
fait primer `roles[]` sur `role`, un compte pourrait donc rester joignable via `role` seul sinon.

## 2. Choix

- Le verrou vit dans `snu-lib` (`DECOMMISSIONED_ROLES`, `isDecommissionedRole`, `ASSIGNABLE_ROLES_LIST`)
  pour être partagé sans duplication entre api, apiv2 et le calcul déjà exporté au front
  (`canInviteUser`, `canUpdateReferent`) : les boutons d'invitation/réactivation de l'admin se masquent
  d'eux-mêmes pour ces rôles sans changement de front dans ce lot.
- Un compte déjà sur l'un de ces rôles reste modifiable pour le reste (téléphone, structure, etc.) :
  seules l'attribution du rôle et la réactivation sont bloquées. Le retrait du rôle lui-même (données,
  documents, permissions) est hors périmètre — lot P25.
- `department` (email d'invitation) reste tel quel : déjà borné à la liste officielle des départements
  par le schéma Joi, ce n'est pas du texte libre contrairement à `region`.
- Les options d'invitation obsolètes de l'admin (chef de centre, transporteur, CLE, visiteur) renvoient
  désormais un 403 : aucun changement de front dans ce lot, jusqu'au retrait des écrans en P26.

## 3. Impact fonctionnel

Nul en usage courant si le recomptage de production confirme 0 compte actif sur ces rôles (note du
08/09/2026, à reconfirmer avant fusion). Si un ADMIN tente d'inviter ou de réactiver l'un de ces
rôles depuis l'admin, il reçoit un 403 sans message dédié tant que P26 n'a pas retiré l'écran.

## 4. Après déploiement

- Recompter en base (`role`, `roles[]`, `subRole` CLE) les comptes sur les rôles décommissionnés,
  actifs et créés après le 04/08/2025, pour confirmer que le recensement du 08/09/2026 tient toujours.
- Figer l'état des collections `permissions` et `roles` pour le `down()` du lot P25.
- Vérifier qu'aucune invitation en attente sur l'un de ces rôles ne circule encore (le lien reste
  valide 7 jours mais l'activation est désormais refusée).
