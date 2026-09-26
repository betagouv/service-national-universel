# Lot P02 : candidatures créées ou réécrites hors du flux, propositions visibles des structures

Date : 2026-09-26 · Ticket GOO-57 · Constats PH1, PH11, PH19 (élevés) et PM3 (moyen) de l'audit du 25/09/2026 ·
Branche `fix/goo-57-candidatures-hors-flux-rebase`, base `origin/main` (`f17fe5bc1`)

Déploiement : api seul. Aucun contrat de front modifié : les appels `POST`/`PUT /application` des fronts envoient déjà
un sous-ensemble des champs conservés. Aucune migration.

## Ce qui est corrigé

### Création : une structure ne crée qu'une proposition (PH1)

`POST /application` laissait le statut et la durée libres pour tout référent. Un responsable ou un superviseur pouvait
créer, pour n'importe quel volontaire éligible, une candidature `DONE` de 84 h. La phase 2 du volontaire était alors
validée, et le volontaire entrait dans le périmètre de la structure (dossier, pièces).

Désormais, hors admin et référents territoriaux (seuls rôles qui saisissent une mission personnalisée déjà
réalisée) :

- le statut est toujours `WAITING_ACCEPTATION` ;
- la durée est celle de la mission.

### Champs dénormalisés dérivés côté serveur (PH19, PH1)

Tous les champs de `applicationKeys` étaient inscriptibles par le client, en création comme en modification :
volontaire, mission, structure, tuteur, contrat, identité. Cela permettait :

- de rattacher une candidature à un autre volontaire (`youngId`) ;
- de basculer sur une autre mission (`missionId`/`structureId`) sans passer par `getAuthorizationToApply` ;
- de désigner les destinataires des notifications (`youngEmail`) ;
- de pointer le contrat d'un autre volontaire ou un référent quelconque (`contractId`/`tutorId`).

Désormais :

- `POST /application` n'accepte que `youngId`, `missionId`, `status` (borné pour le volontaire) et `missionDuration`
  (référents seulement). Identité, département et cohorte du volontaire, nom et territoire de la mission, tuteur :
  tout est recopié du volontaire et de la mission.
- `PUT /application` n'accepte que `_id`, `status`, `missionDuration`, `hidden`, `priority` et, pour un référent,
  `statusComment`. Les autres clés sont ignorées. `youngId` est refusé (400) à un référent, et doit rester le sien
  pour un volontaire.

### Relecture du contrat et du tuteur (PH19)

`GET /young/:id/application` joignait le contrat et le tuteur désignés par la candidature, sans contrôle. Il ne
renvoie désormais :

- le contrat que s'il appartient au volontaire ;
- le tuteur que s'il appartient à la structure de la candidature, réduit à son identité et ses coordonnées
  (`_id`, prénom, nom, email, téléphones).

Cela couvre aussi les pointeurs déjà corrompus en base, sans script de reprise.

### Propositions invisibles des structures (PH11)

`GET /mission/:id/application` devait masquer les propositions aux responsables et superviseurs, mais le littéral
comparé portait une espace finale (`"WAITING_ACCEPTATION "`) et ne filtrait rien.

Dans `young/youngScope.ts`, `isYoungInStructureScope`, `isYoungInMilitaryPreparationStructureScope` et
`getApplicationScopeFilter` ignorent désormais les candidatures `WAITING_ACCEPTATION`. Tant que le volontaire n'a
pas accepté une proposition, la structure n'accède ni à son dossier (`GET /referent/young/:id`), ni à ses pièces,
ni à ses candidatures (`GET /young/:id/application`). C'est la règle que l'index Elasticsearch des candidatures
appliquait déjà.

### Pièces de candidature (PM3)

Au téléchargement (`GET /application/:id/file/:key/:name`) :

- la clé doit être l'une des quatre listes de pièces (400 sinon) ;
- le nom doit figurer dans la liste de la candidature (403 sinon).

Au dépôt (`POST /application/:id/file/:key`) :

- les pièces sont rangées par candidature, sous `app/young/<youngId>/application/<applicationId>/<key>/<name>`,
  ce qui empêche un dépôt de remplacer la pièce homonyme d'une autre candidature ;
- la liste enregistrée ne retient que des noms déjà présents ou déposés dans la requête : un nom quelconque ne
  peut plus y être ajouté pour ouvrir la lecture d'une autre pièce.

Les pièces déposées avant ce correctif restent lues à leur ancien emplacement (repli si l'objet n'existe pas sous
le nouveau chemin). La purge des fichiers d'un volontaire (`app/young/<id>/`) couvre les deux emplacements.

## Comportements modifiés

- Une structure ne voit plus, ni dans la liste des candidatures d'une mission ni dans le dossier du volontaire, un
  volontaire à qui la mission a seulement été proposée. L'admin masquait déjà ces propositions côté client.
- Une candidature créée par une structure est une proposition que le volontaire doit accepter.

## Après déploiement (lecture seule, revue humaine avant toute correction)

- Candidatures créées par un responsable ou un superviseur dans un autre statut que `WAITING_ACCEPTATION`.
- Candidatures dont `contractId` ne désigne pas un contrat de la candidature, ou dont `tutorId` ne désigne pas un
  référent de la structure.

## Tests

`src/__tests__/lot-p02-candidatures.test.ts` ; assertion ajoutée dans `application-security.test.ts` (H1).
