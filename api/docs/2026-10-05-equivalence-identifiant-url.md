# Équivalences — le volontaire et l'équivalence visés viennent de l'URL

Constats H51, H52 et H53 de l'audit du 21/09/2026 (correctif D du lot, resté incomplet après #5424),
vérifiés ouverts le 2026-10-05 sur `origin/main` @ `b46218e79`, puis corrigés.
Le contrôleur `api/src/equivalence/equivalenceController.ts` n'avait pas changé depuis le commit audité.

Invariant rétabli : sur les routes `/young/:id/phase2/equivalence`, le volontaire visé est celui de
l'URL (`req.targetYoung`, chargé et contrôlé par `youngPerimeterMiddleware`) et l'équivalence visée est
celle de l'URL (`req.params.idEquivalence`). Aucun identifiant du corps de la requête n'est lu.

## 1. Correctif

| Route | Avant | Après |
| --- | --- | --- |
| `POST /young/:id/phase2/equivalence` | Le schéma de validation exigeait un `id` et la requête validée fusionnait paramètres d'URL et corps, le corps l'emportant. L'équivalence était rattachée à cet `id` fusionné, alors que le périmètre ne contrôle que l'`id` de l'URL | Le schéma ne porte plus que les champs de l'équivalence, validés sur le corps seul. `youngId` est celui de `req.targetYoung` |
| `PUT /young/:id/phase2/equivalence/:idEquivalence` | Même fusion : l'équivalence chargée était celle de l'`idEquivalence` fusionné | L'équivalence est chargée avec `req.params.idEquivalence`. Le garde existant (elle doit appartenir au volontaire de l'URL) s'applique donc à l'équivalence réellement modifiée |
| `GET /`, `GET /:idEquivalence`, `DELETE /:idEquivalence` | Lisaient déjà l'URL seule | Inchangés, couverts par des tests |

Un `id`, un `idEquivalence` ou un `youngId` présent dans le corps est ignoré (`stripUnknown`), et non
refusé : les fronts (`app` et `admin`) n'en envoient aucun, mais l'ignorer ne change rien pour un client
qui en enverrait un.

## 2. Choix

- **Aucun changement visible** : les fronts n'envoient aucun identifiant dans le corps (vérifié dans
  `app/src/scenes/phase2` et `admin/src/scenes/volontaires`). Les réponses des appels légitimes sont
  identiques.
- **Ignorer plutôt que refuser** : un refus 400 n'apporterait rien à l'invariant et risquerait de
  casser un client qui renverrait la ressource lue telle quelle.
- **Identifiant d'équivalence mal formé en PUT** : le correctif principal ne change pas la réponse
  (erreur serveur au chargement). Le passage en 400 est un commit séparé, « visible : », à écarter si ce
  changement de réponse n'est pas retenu ; aucun front n'envoie un tel identifiant.

## 3. Variantes examinées

Les autres sites de l'API qui fusionnent paramètres d'URL et corps dans une validation ont été relus.
Aucun ne contrôle l'accès sur un identifiant (celui de l'URL) différent de celui que l'action utilise :
le contrôle y porte sur la ressource résolue, la même que celle qui est modifiée. Ils ne sont pas
modifiés.

## 4. Tests

`api/src/__tests__/equivalence-url-identifier.test.ts` :

- création : un volontaire, un référent départemental, un référent régional et un admin ne créent rien
  pour un volontaire désigné dans le corps, et l'équivalence créée est celle du volontaire de l'URL ;
- modification : l'équivalence modifiée est celle de l'URL, qu'une autre équivalence du même volontaire
  ou d'un tiers soit désignée dans le corps ; l'équivalence d'un tiers visée par l'URL reste refusée ;
- lecture et suppression : l'URL seule fait foi ;
- non-régression : création et modification légitimes (volontaire sur lui-même, référents dans leur
  périmètre, admin).

## 5. Fichiers touchés

`api/src/equivalence/equivalenceController.ts`, `api/src/equivalence/equivalenceValidator.ts`,
`api/src/__tests__/equivalence-url-identifier.test.ts`.
