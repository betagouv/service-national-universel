# Lot P07 — référents : email et mot de passe non modifiables en libre-service

Audit de sécurité de la production du 25/09/2026, constats PH12 et PH17 (ticket Linear GOO-62,
résiduel de H72). Vérifié ouvert puis corrigé le 2026-09-26 sur `origin/main` @ `aa4aa9316`.

## 1. Constat

`PUT /referent/` (auto-mise à jour du profil) appliquait tout email et mot de passe soumis sans mot
de passe courant ni validation par la nouvelle adresse, pour toute session non impersonée — le seul
garde-fou existant (H61, `req.user.impersonateId`) ne s'appliquait que sous usurpation. Or l'identité
support (`api/src/controllers/SNUpport.ts`) et le périmètre de lecture des notifications
(`emailNotificationScope.ts`) se fondent sur `user.email`, relu à chaque requête. N'importe quel
compte référent, y compris de faible privilège (RESPONSIBLE, SUPERVISOR, VISITOR, TRANSPORTER),
pouvait donc s'attribuer temporairement l'email d'un tiers pour lire l'historique support de sa
victime (messages, pièces jointes déchiffrées) et ses notifications transactionnelles, avant de
revenir à son email d'origine sans jamais être déconnecté (PH12, PH17). Vecteur secondaire fermé au
passage : `POST /young/signup/email` appliquait de même le nouvel email d'un compte jeune en base
avant toute validation par le jeton envoyé à cette adresse.

## 2. Correctifs

| Point | Route | Correctif |
| --- | --- | --- |
| Email / mot de passe | `PUT /referent/` | `validateSelf` (`api/src/utils/validator.ts`) ne déclare plus les clés `email` ni `password` : `stripUnknown` les retire silencieusement du body, impersonation ou non. Le garde H61, devenu mort (`value` ne contient jamais ces champs), est retiré de `referentController.ts` |
| Vecteur secondaire | `POST /young/signup/email` | Route et handler `changeEmailDuringSignUp` supprimés : aucun appelant dans `app/src` ni `admin/src`, les inscriptions en ligne sont fermées depuis M3 (lot H1) |

## 3. Choix

- Retrait plutôt que flux de confirmation par email : un flux `newEmail`/`tokenEmailValidation` sur le
  modèle des jeunes (`auth.ts`) sort du budget du lot (taille S) et n'était pas requis pour fermer les
  deux constats. Le mot de passe se change déjà par `POST /referent/reset_password`, qui exige
  l'ancien et n'est pas modifié par ce lot.
- No-op silencieux plutôt que 403 explicite : le formulaire de profil admin poste l'objet complet, y
  compris l'email courant, à chaque enregistrement ; un rejet explicite aurait cassé l'écran pour toute
  modification (prénom, nom, téléphone) tant que l'email reste inchangé dans le payload.
- L'impersonation (`signin_as`/`restore_signin`, PH14/PL7) est traitée à part, dans le lot P27
  (GOO-71) : ce lot ne touche ni `passport.ts` ni les fichiers apiv2 d'authentification.

## 4. Risque fonctionnel

Perte assumée : un référent ne change plus son email lui-même. Un ADMIN le fait via
`PUT /referent/:id`. Le formulaire de profil continue de répondre 200 et le champ email revient
silencieusement à sa valeur en base après enregistrement — à signaler au support en cas de question
d'un référent.

## 5. Après déploiement

- Prévenir le support de la perte fonctionnelle (email référent non modifiable en self-service).
- Étendre le script d'audit GOO-40 (`fix/goo-40-audit-patches-referents`) aux changements d'email en
  libre-service suivis d'un retour à l'adresse d'origine dans l'historique `mongoose-patch-history` :
  c'est la signature de l'exploit PH12/PH17 avant ce correctif.
