# Lot P11 — api : annuaires des référents, oracles par email et notifications

Audit de sécurité de la production du 25/09/2026, constats PM11, PM21, PM25, PM30 (moyenne) et PL10
(faible) (ticket Linear GOO-73). Vérifiés ouverts le 2026-10-05 sur `origin/main` @ `5465415ab`, puis
corrigés. PM10, également rattaché au lot, n'est **pas** corrigé : voir la section 2.
Le lot reprend aussi GOO-46 (PR #5410, en conflit depuis le 24/09), dont
il réutilise `getStructureIdsInPerimeter` et `isReferentReadableByUser` : premier commit de la branche.

Principe commun : une recherche par email ou une notification ne renvoie jamais un compte dont la
fiche serait refusée (`isReferentReadableByUser`), et une réponse hors périmètre est indiscernable de
celle d'une adresse inconnue.

## 1. Constats et correctifs

| Constat | Route / fichier | Avant | Après |
| --- | --- | --- | --- |
| GOO-46 | `POST /elasticsearch/referent/:action` (`getStructureIdsInPerimeter`), `GET /referent/:id` (`isReferentReadableByUser`) | Un référent départemental listait les responsables de toutes les structures de sa région (et des têtes de réseau), dont les fiches répondaient 403 ; les référents régionaux et visiteurs de sa région apparaissaient en liste mais leur fiche répondait 403 | Structures de ses seuls départements ; référents régionaux et visiteurs de sa région lisibles en fiche (lecture seule) |
| PM11 | `POST /elasticsearch/referent/team/:action` (onglet Équipe) | Sans `tab`, seule la région bornait la requête : tous les comptes de la région, tous rôles confondus (dont les responsables). La taille lisait `body.syze` (faute de frappe) : la taille demandée par le front était ignorée, et n'importe quelle valeur passait sous ce nom | `tab` obligatoire pour les référents départementaux et régionaux (le front l'envoie toujours) ; taille issue de `joiElasticSearch` (0 ou 10 à 100). Le contenu des onglets est inchangé |
| PM30 | `GET /referent?email=` | Matrice de rôles seule (`canGetReferentByEmail`) : oracle national (nom, rôle, territoire) pour un référent départemental ou régional | `isReferentReadableByUser` ; hors périmètre, même 404 qu'une adresse inconnue |
| PM21 | `GET /young?email=` | 200 `data:null` pour une adresse inconnue, mais 403 hors territoire : l'écart révélait l'existence d'un compte volontaire n'importe où en France | 200 `data:null` dans les deux cas |
| PM25 | `GET /email?email=`, `GET /email/:id`, `POST /elasticsearch/email/:email/:action` (`emailNotificationScope.ts`) | Table `REFERENT_ROLES_VISIBLE_BY` : un référent départemental ou régional lisait sans condition géographique les notifications des responsables, superviseurs (et anciens rôles chef de centre / CLE) de tout le pays | Règle de lecture de la fiche (`isReferentReadableByUser`), projection élargie à `cohesionCenterId`/`sessionPhase1Id` ; l'exclusion explicite des comptes ADMIN est conservée (un admin peut porter une géographie) ; table supprimée |
| PL10 | `ES_REFERENT_SENSITIVE_FIELDS` (snu-lib) — annuaire ES, export, `team` des structures | `lastLogoutAt` et `metadata` (état d'invitation) restitués, alors que `serializeReferent` retirait déjà `lastLogoutAt` | Ajoutés à la liste : exclus du `_source` ES et retirés à la sérialisation |

## 2. Choix

- **Fonctionnel inchangé, décision du 05/10** : deux durcissements proposés dans ce lot ont été
  écartés pour garder le comportement existant.
  - **PM10 non corrigé** : un référent départemental ou régional garde l'accès à l'équipe (nom,
    email) de n'importe quelle structure dans le sélecteur de tuteur
    (`POST /elasticsearch/referent/structure/:structure`).
  - **Onglet département de « Mon équipe »** : un référent départemental voit toujours les
    référents départementaux de toute sa région, y compris ceux dont la fiche lui répond 403.
- **404 / `data:null` plutôt que 403** (PM21, PM30) : une réponse distincte pour « hors périmètre »
  suffit à tester l'existence d'une adresse. Aucun front n'appelle ces deux routes aujourd'hui.
- La branche chef de centre de `buildReferentContext` n'est pas touchée : elle part en P25 avec le
  retrait des rôles décommissionnés.
- Correctif de type dans le commit GOO-46 repris : `target.role` peut être absent
  (`referentScope.ts`), ce qui faisait échouer le type-check ts-jest de toutes les suites chargeant
  les routes.

## 3. Fichiers touchés

`api/src/controllers/elasticsearch/referent.ts`, `api/src/referent/referentController.ts`,
`api/src/referent/referentScope.ts`, `api/src/controllers/young/index.ts`,
`api/src/email/emailNotificationScope.ts`, `packages/lib/src/constants/elasticsearch.ts`.

## 4. Tests

- `elasticsearch-scope.test.ts` : describe GOO-46 (repris de #5410) et nouveau describe P11 — PM11
  (400 sans onglet en search et export, onglet département inchangé : référents départementaux de
  la région, `syze` ignoré, taille validée et plafonnée), PL10 (`lastLogoutAt` et `metadata`
  absents). Le test H24 de l'export Équipe passe désormais `?tab=region`.
- `referent-security.test.ts` (M68) : PM30 — compte hors territoire (référent départemental, puis
  responsable d'une autre région pour un référent régional) en 404, réponse identique à une adresse
  inconnue. Le test « laisse passer un référent départemental » avait une cible à géographie tirée au
  hasard par la fixture : géographie fixée.
- `young-security.test.ts` (C17) : le test qui attendait 403 attend désormais `data:null`, plus un
  cas « hors périmètre = adresse inconnue » (PM21).
- `email-scope.test.ts` : PM25 — responsable hors territoire refusé (liste et ES), référent
  départemental d'une autre région refusé au référent régional, responsable du département accepté,
  admin rattaché au département toujours refusé.
- RED vérifié avant correctif : chaque test des constats corrigés échouait pour la raison
  attendue. Après : suites concernées vertes, snu-lib vert (382 tests), `tsc --noEmit` propre.

## 5. Après déploiement

- Déployer api et snu-lib ensemble (snu-lib est embarqué au build de l'api) ; aucune migration.
- Si les journaux le permettent, mesurer les appels à `GET /referent?email=`, `GET /young?email=`
  et `GET /email?email=` faits par des référents hors de leur territoire avant ce correctif.
