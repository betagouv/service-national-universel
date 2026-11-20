# Lot P25b : périmètres, édition et routes réservées, rôles décommissionnés (GOO-165)

Deuxième PR du décommissionnement (P25, sous-ticket 2/4), après P25a (GOO-164, fusionnée). Périmètre :
`api` et `packages/lib`. Rôles décommissionnés : chef de centre et adjoint, référent sanitaire,
référent de classe, administrateur CLE (référent d'établissement et coordinateur), transporteur,
visiteur. DSNJ et INJEP sont conservés.

## 1. Retiré

| Surface | Changement |
| --- | --- |
| `packages/lib/src/roles.ts` | Les branches des 7 rôles retirées dans `canEditYoung`, `canDeletePatchesHistory`, `canViewNotes`, `canViewReferent`, `canUpdateReferent` (branche `isReferentModifyingHeadCenterWithoutChangingRole`), `canViewYoung`, `canDownloadYoungDocuments`, `canInviteYoung`. `canSigninAs` : branche `source === "referent"` fermée par un `return false` explicite (plus aucune cible referent). `canAllowSNU` et `canValidateMultipleYoungsInClass` (gardes des écritures CLE réservées, section 3) : retournent désormais toujours `false`. Les signatures ne changent pas. |
| `api` — périmètres | Branches des 7 rôles retirées dans `youngScope.ts` (`canEditYoungInScope`, `isSessionPhase1InUserScope`, `isYoungInUserScope`), `referentScope.ts` (`isReferentReadableByUser`), `classeScope.ts` (`isClasseInUserScope`), `etablissementScope.ts` (`isEtablissementInUserScope`), `sejourAccess.ts` (`canActOnLigneBus`), `emailNotificationScope.ts` (`isYoungInScope`/`isEmailInUserScope`). `getLigneBusScope` : déjà fail-closed via `getGeoScopeFilter`, rien à retirer. |
| `api` — routes et contrôles d'entrée | `GET /cle/etablissement/from-user` : recherche par classe et `populateEtablissementWithClasse` (code mort, déjà bloqués par la garde `canViewEtablissement` réduite en P25a) retirés. `GET /referent/youngFile/:youngId/:key/:fileName` : cas chef de centre/adjoint/référent sanitaire retiré du switch. `PUT /young-edition/ref-allow-snu`, `/:id/ref-allow-snu`, `PUT /referent/youngs` : gardes neutralisées, routes répondent désormais 403 pour tout acteur. `GET /cle/classe/:id`, `GET /cle/classe/:id/patches` (`classeController.ts`) et `GET /young/:id/patches` (`controllers/young/index.ts`) : rôles CLE retirés des `accessControlMiddleware` (défense en profondeur, le périmètre renvoyait déjà `false`). |

Chaque rôle est sorti du contrôle d'entrée dans le même commit que sa branche, ou dans un commit
séparé publié avant l'ouverture de cette PR pour les 3 gardes relevées par la relecture (classe,
young patches) : aucun rôle retiré n'arrive sur un filtre vide.

## 2. Décisions à valider

1. **Code mort retiré dans ce lot** (et non laissé pour un lot séparé) : le ticket le demande
   explicitement (« retire le rôle du contrôle d'entrée dans le même commit que sa branche ») et liste
   nommément `GET /cle/etablissement/from-user` et le cas chef de centre de `GET /referent/youngFile`
   parmi les éléments à traiter dans ce lot.
2. **`canAllowSNU` et `canValidateMultipleYoungsInClass` traitées comme faisant partie du lot** bien que
   non nommées par leur nom de fonction dans la section 1 du ticket : la section 3 les cite par route
   (« écritures que seuls les rôles CLE pouvaient appeler, à supprimer »).
3. **Changement de comportement pour `REFERENT_DEPARTMENT`/`REFERENT_REGION`, à confirmer** : en retirant
   `isReferentModifyingHeadCenterWithoutChangingRole` (demandé par la section 1 du ticket), un référent
   départemental ou régional ne peut plus modifier un compte chef de centre/adjoint/référent sanitaire
   encore présent en base via `PUT /referent/:id` (`api/src/referent/referentController.ts:1465`,
   `canUpdateReferent`). Côté admin, le bouton d'édition disparaît déjà (`admin/src/scenes/team/list.jsx:240`,
   `admin/src/scenes/team/panel.jsx:75`, lecture seule via `admin/src/scenes/utilisateur/edit/details.jsx:217`
   — ces 3 appels passent par le même helper `canUpdateReferent`, donc l'écran suit le changement sans
   modification front). De même, `canSigninAs` masque déjà « Prendre sa place » sur un compte CLE pour
   ces deux rôles (`admin/src/scenes/utilisateur/composants/UserHeader.tsx:107`,
   `admin/src/scenes/utilisateur/list.tsx:389`, `admin/src/scenes/utilisateur/panel.jsx:115`). Ce retrait
   est demandé littéralement par le ticket (section 1) ; il entre en tension avec la phrase générale de
   risque « ADMIN/REFERENT_DEPARTMENT/REFERENT_REGION doivent garder 100 % de leurs droits actuels », qui
   vise la consultation CLE/phase 1, pas l'édition d'un compte à rôle désormais décommissionné.
4. **Correction d'un message de commit déjà poussé publiquement** (`58e7f8fe9`, irréversible sans réécrire
   l'historique public) : son message et la décision correspondante affirmaient qu'un `REFERENT_REGION`
   pouvait, avant ce lot, se connecter en tant que compte CLE **sans passer par le filtre de rôle cible**
   (`allowedTargetRoles`, `roles.ts:798` sur `origin/main`). Une relecture indépendante a montré que ce
   filtre s'exécutait bel et bien avant le fallthrough région : ce n'était pas un contournement, c'était le
   comportement voulu (connexion en tant que compte CLE de sa région). Le `return false` explicite ajouté
   reste correct et souhaité (fail-closed, cohérent avec le décommissionnement), mais aucun contournement
   préexistant n'a réellement existé : à lire comme un durcissement, pas comme la correction d'une faille.

## 3. Hors périmètre (lots suivants)

- Branches acteur des 7 rôles dans `roles.ts` hors de la liste de la section 1 (`canSeeYoungInfo`,
  `canEditSanitaryEmailContact`, `isSessionEditionOpen`, `isPdrEditionOpen`, `isBusEditionOpen`,
  `canSendPlanDeTransport`, `canEditPresenceYoung`, `canUpdateMeetingPoint`, `canCreateMeetingPoint`,
  `canViewMeetingPointId`, `canViewInscriptionGoals`, `canUpdateLigneBus`,
  `ligneBusCan*DemandeDeModification`, `canCreateClasse`, `canEditEstimatedSeats`, `canEditTotalSeats`,
  `canManageMig`) et `api/src/controllers/program.ts`, `api/src/services/support.js`,
  `api/src/cle/classe/classeService.ts`.
- Création de comptes `REFERENT_CLASSE`/`ADMINISTRATEUR_CLE` encore possible côté service
  (`api/src/services/cle/referent.ts:101,233`) : migration et fermeture par P25d.
- `VISITOR` comme rôle **cible** dans `referentScope.ts:180` et `elasticsearch/referent.ts` : comptes
  existants, traités par P25d.
- Écrans admin et helpers `roles.ts` encore appelés par l'admin (~40 fichiers) : GOO-88, une fois
  GOO-164/165/166 fusionnés.

## 4. Tests

- `packages/lib/src/roles.spec.ts` : 76/76 verts. 11 tests nouveaux/modifiés (9 helpers section 1 +
  `canAllowSNU`/`canValidateMultipleYoungsInClass`), chacun confirmé rouge par mutation puis revert.
- `api/src/__tests__/decommissioned-roles-scope.test.ts` (nouveau, DB réelle) : 8 tests directs sur les
  fonctions de périmètre exportées (acteur à rôle décommissionné → refus), tous confirmés rouges par
  mutation puis revert.
- `api/src/__tests__/goo165-cle-reserved-routes.test.ts` (nouveau) : 6 cas sur les 3 routes CLE
  réservées, mutation par `git stash` du correctif de `roles.ts` → 6/6 rouges (404 au lieu de 403),
  stash restauré.
- `api/src/__tests__/referent-young-file-security.test.ts` (étendu) : cas chef de centre retiré du
  switch, confirmé rouge avant retrait, 16/16 verts après (pas de régression sur les 15 tests existants).
- `api/src/__tests__/etablissementController` : `GET /cle/etablissement/from-user`, non-régression
  citée via `consultation-decommissionnement-p25a.test.ts` (toujours verte, comportement HTTP inchangé).
- Tests existants mis à jour après relecture (chemin autorisé d'un rôle décommissionné → refus, chemin
  ADMIN/REFERENT_DEPARTMENT/REFERENT_REGION conservé) : `young-edition-security.test.ts`,
  `cle-perimetre-security.test.ts`, `referent-security.test.ts`.

Après fusion : vérifier à l'écran, en ADMIN et en référent départemental et régional, les fiches jeune,
référent, classe et établissement.
