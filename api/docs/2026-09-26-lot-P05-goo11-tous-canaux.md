# Lot P05 — décision GOO-11 appliquée à tous les canaux

Audit de sécurité de la production du 25/09/2026, constats PH3, PH9, PH16 et PH20 (ticket Linear
GOO-60). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main` @ `ba1412135`.

GOO-11 masque déjà les données de santé, les pièces d'identité et les notes internes du volontaire
dans `serializeYoung`/`serializeYoungs` pour les responsables et superviseurs de structure. Ce lot
ferme les canaux annexes où le même dossier ressortait quand même : dépôt de pièce de candidature,
recherche/agrégations Elasticsearch, et deux routes du contrôleur référent qui renvoyaient le
document Mongo brut.

## 1. Correctifs

| Constat | Route / fonction | Correctif |
| --- | --- | --- |
| PH3 | `POST /application/:id/file/:key` | `serializeYoung(user, user)` → `serializeYoung(user, req.user)` : le second argument doit être l'acteur authentifié (un responsable, potentiellement), pas le jeune candidat lui-même |
| PH16 | `POST /referent/young/:id/refuse-military-preparation-files`, `PUT /referent/young/:id/change-cohort` | les deux réponses envoyaient le document Mongo brut (`data: young`, jetons de session/réinitialisation compris) ; remplacées par `serializeYoung(young, req.user)` |
| PH20 | `GET /young/:id/documents/:key(/:fileId)`, `GET /referent/youngFile/:youngId/:key/:fileName` | nouveau helper `canAccessYoungFileKeyInScope` (`api/src/young/youngScope.ts`) : un responsable/superviseur en périmètre (candidature dans sa structure) n'obtient plus `cniFiles`, `autoTestPCRFiles`, ni les pièces de préparation militaire hors structure de préparation militaire. Les autres clés (`imageRightFiles`, etc.) restent accessibles. Les rôles en périmètre d'édition (référent territorial, chef de centre, référent CLE) gardent accès à toute clé, comme avant |
| PH9 | `POST /elasticsearch/young/search`, `/export`, `/young-having-school-in-dep-or-region/:action` | `getYoungsFilters(user)` dérive désormais la liste des filtres/agrégations exposés de `getYoungFieldsHiddenFrom(user)` (même source que le sérialiseur) au lieu d'une liste fixe ; un filtre explicitement masqué pour le rôle appelant est refusé en 400 (`hasMaskedFilter`) plutôt que retiré en silence par `stripUnknown` |

## 2. Choix

- **`autoTestPCRFiles` traité comme donnée sensible bien qu'absent de `YOUNG_HEALTH_FIELDS`** :
  extension de politique volontaire pour `canAccessYoungFileKeyInScope`, cohérente avec le
  traitement déjà réservé à `cniFiles`. Pas un simple miroir du serializer.
- **`hasNotes.keyword` masqué en ES quand `notes` l'est côté fiche** : `hasNotes` est absent de
  `getYoungFieldsHiddenFrom` (ce n'est pas le contenu de la note), mais sa seule présence reste un
  signal qu'une structure d'accueil n'a pas à filtrer.
- **`schoolName.keyword` reste réservé au référent départemental** dans `getYoungsFilters`, sans
  rapport avec GOO-11 — comportement préexistant conservé tel quel.
- **Le contrôle d'autorisation passe toujours avant le contrôle de filtre masqué** dans les deux
  routes ES : un rôle sans périmètre sur la route (ex. RESPONSIBLE sur
  `young-having-school-in-dep-or-region`) reçoit toujours 403, pas 400.
- **PH16 sur `change-cohort` ne se ferme qu'en partie** : la route reste accessible (ADMIN,
  REFERENT_DEPARTMENT, REFERENT_REGION uniquement, `canChangeYoungCohort`) ; seule la fuite de
  jetons dans la réponse est corrigée ici. Le lot P23 (GOO-65) supprime la route elle-même.
- **`documents.js` reste en JavaScript** : le nouveau helper est importé par `require()` depuis
  `youngScope.ts`, comme le fait déjà ce fichier pour les modèles Mongoose.

## 3. Impact fonctionnel

- Un responsable ou superviseur de structure ne peut plus télécharger ni lister `cniFiles`,
  `autoTestPCRFiles`, ni les pièces de préparation militaire d'un candidat hors structure de
  préparation militaire, même si le volontaire a candidaté chez lui. Le front qui proposait ce
  téléchargement recevra un 403 : à vérifier avant déploiement (l'audit des fronts du 23/09/2026
  avait déjà retiré ces champs de l'affichage, GOO-11).
- Un responsable/superviseur qui filtre ou exporte l'index `young` avec un filtre santé/identité
  (`handicap`, `allergies`, `ppsBeneficiary`, `paiBeneficiary`, `specificAmenagment`,
  `reducedMobilityAccess`, `handicapInSameDepartment`, `CNIFileNotValidOnStart`, `hasNotes`) reçoit
  désormais un 400 explicite au lieu d'un filtre silencieusement ignoré. Un front qui poserait ce
  filtre par défaut pour ces rôles casserait la recherche : à vérifier avant déploiement.
- Le dépôt d'une pièce de candidature (`POST /application/:id/file/:key`) et le refus de pièces de
  préparation militaire ne renvoient plus le dossier volontaire complet à un responsable : les
  champs de santé/identité en disparaissent de la réponse, comme partout ailleurs depuis GOO-11.

## 4. Après déploiement

- Chercher dans les journaux d'accès les téléchargements `cniFiles` et `autoTestPCRFiles`, et les
  exports/recherches ES filtrés sur la santé, faits par des comptes RESPONSIBLE/SUPERVISOR.
- Si un `forgotPasswordResetToken` ou un autre jeton de session a pu fuiter via
  `refuse-military-preparation-files` ou `change-cohort` avant ce correctif, purger ces jetons pour
  les jeunes concernés.
- Fusionner après le lot P02 (GOO-57) : mêmes fichiers `youngScope.ts` et `applicationController.ts`.
- Le lot P23 (GOO-65) doit encore supprimer la route `PUT /referent/young/:id/change-cohort` pour
  fermer PH16 en totalité.
