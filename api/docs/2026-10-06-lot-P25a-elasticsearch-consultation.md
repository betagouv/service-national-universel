# Lot P25a : Elasticsearch et consultation, rôles décommissionnés (GOO-164)

Première PR du décommissionnement (P25, sous-ticket 1/4). Périmètre : `api` et `packages/lib`.
Rôles décommissionnés : chef de centre et adjoint, référent sanitaire, référent de classe,
administrateur CLE (référent d'établissement et coordinateur), transporteur, visiteur. DSNJ et INJEP
sont conservés. ADMIN, REFERENT_DEPARTMENT et REFERENT_REGION gardent toute la consultation.

## 1. Retiré

| Surface | Changement |
| --- | --- |
| `packages/lib/src/roles.ts` | Les helpers de recherche et de consultation (`canSearchInElasticSearch`, `canSearchSessionPhase1`, `canViewCohesionCenter`, `canViewMeetingPoints`, `canSearchMeetingPoints`, `canSearchLigneBus`, `canExportLigneBus`, `ligneBusCanViewDemandeDeModification`, `canSeeDashboard*`, `canViewClasse`, `canViewEtablissement`, `canSearchStudent`, `canViewDepartmentService`, `canShareSessionPhase1`, `canSendImageRightsForSessionPhase1`, `canCreateOrUpdateSessionPhase1`, `canViewSessionPhase1`) n'acceptent plus que ADMIN et les référents départemental et régional (responsable et superviseur de service départemental conservés pour `canViewDepartmentService`). `canExportConvoyeur` : ADMIN seul. Index `youngCle` supprimé de `canSearchInElasticSearch`. `canSeeDashboardSejourHeadCenter` supprimée (aucun appelant). Les signatures ne changent pas. |
| `api/src/controllers/elasticsearch` | Branches des rôles retirés supprimées dans `young.ts`, `utils.ts`, `referent.ts`, `plandetransport.js`, `lignebus.js`, `cle/classe.js`, `dashboard/inscription.js`, `schoolramses.js`. Route `cle/young` supprimée. Route `dashboard/sejour/head-center` supprimée. `getLigneBusScope` (`services/sejourAccess.ts`) : ADMIN seul. |
| Contacts | Dans la consultation CLE et phase 1 (`needRefInfo` des classes, export des classes, référents de l'établissement, `needHeadCenterInfo` des sessions), les référents de classe, chefs d'établissement, coordinateurs et chefs de centre ne renvoient plus que `_id`, `firstName`, `lastName` et `state` : ni email ni téléphone. Le jeton d'invitation du chef de centre n'est plus renvoyé non plus (`serializeReferentNames`, `api/src/utils/es-serializer.js`). |

Chaque rôle est sorti du contrôle d'entrée dans le même commit que sa branche : aucun rôle retiré
n'arrive sur un filtre vide.

## 2. Choix

- **Projection des contacts** : `{_id, firstName, lastName, state}`. `state` (Actif/Inactif) est lu par
  `admin/src/scenes/classe/utils/index.ts:258,268` et ne porte aucune coordonnée.
- **Visiteur et chef de centre** : retirés comme acteurs des contrôles et des branches. Ils restent
  comme cibles dans les filtres de liste de `referent.ts` : les comptes existants sont traités par la
  migration de données (P25d).
- **`getResponsibleCenterField`** conservé (appelant `young/youngScope.ts`) : P25b.

## 3. Hors périmètre

- `canActOnLigneBus`, `canUpdateLigneBus`, `canCreateMeetingPoint`, `canUpdateMeetingPoint` pour le
  transporteur : P25b.
- Routes de consultation hors Elasticsearch qui renvoient encore email et téléphone des référents de
  classe, chefs d'établissement, coordinateurs et chefs de centre à ADMIN et aux référents :
  `GET /session-phase1/:id`, `GET /cle/classe` et `GET /cle/classe/:id`, `GET /cle/classe/from-etablissement/:id`,
  export des classes, `GET /cle/etablissement/:id`, `GET /cle/referent?ids=`, et l'annuaire
  `POST /elasticsearch/referent/search`. La décision « noms seulement » est appliquée ici aux index
  Elasticsearch ; son extension à ces routes reste à décider.
- `GET /referent/:id/session-phase1` ne renvoie des sessions que pour un compte cible chef de centre,
  adjoint ou référent sanitaire : sans objet une fois les comptes migrés (P25d), conservée.
- Admin, pour GOO-88 : l'écran `/mes-eleves` appelle la route supprimée `cle/young` ;
  `GET /cle/etablissement/from-user` n'a plus d'appelant possible.

## 4. Tests

- `packages/lib/src/roles.spec.ts` : chaque helper × chaque rôle retiré refusé, ADMIN et référents
  acceptés, index `youngCle` refusé.
- `api/src/__tests__/elasticsearch-decommissionnement-p25a.test.ts` : 16 routes Elasticsearch ×
  7 rôles retirés (403 sans appel Elasticsearch ; ces comptes sont déjà refusés à l'authentification, ces 403 sont une défense en profondeur), routes retirées (404), ADMIN et référents (200).
- `api/src/__tests__/consultation-decommissionnement-p25a.test.ts` : routes de consultation hors
  Elasticsearch (session, point de rassemblement, service départemental, demande de modification,
  export convoyeur, fiches classe, établissement, élèves par classe).
- `api/src/__tests__/elasticsearch-contacts-noms-p25a.test.ts` : noms seulement sur les quatre chemins.
- Tests existants réécrits (`elasticsearch-lot-l4`, `elasticsearch-scope`, `cle-perimetre-security`,
  `cle-classe-security`) : le chemin réussi d'un rôle retiré devient un refus ; le chemin réussi
  ADMIN et référents est conservé.

Après fusion : vérifier à l'écran, en ADMIN et en référent départemental et régional, les fiches
classe, établissement, session, centre et ligne.
