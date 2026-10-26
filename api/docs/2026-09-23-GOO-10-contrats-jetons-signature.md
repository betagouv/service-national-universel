# GOO-10 — contrats d'engagement : jetons de signature et page de signature (FH3, FL1)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`4587c1d70`)

Les deux constats ont été relus sur le code courant avant correction : tous deux confirmés.

## Ce qui change

| Id | Où | Avant | Après |
|---|---|---|---|
| FH3 | `api` `serializeContract` (GET /contract/:id, GET /application/:id/contract, POST /contract) | les cinq jetons de signature (représentant de l'État, structure, parents 1 et 2, volontaire) étaient renvoyés à tout référent du périmètre, responsables et superviseurs compris : avec le jeton, `POST /contract/token/:token` valide la signature du tiers | les jetons ne sont renvoyés à aucun rôle ; ils ne circulent que dans l'email envoyé à chaque signataire |
| FH3 | `admin` : `components/Contract.jsx`, `volontaires-responsible/view/application.jsx`, `volontaires/view/phase2bis/application.jsx` | bouton « Copier le lien de validation » construit à partir du jeton | bouton retiré ; « Renvoyer le lien par email » (qui passe par `POST /contract/:id/send-email/:type`, cloisonné) reste disponible pour tous les rôles |
| FL1 | `app` `/validate-contract` (`scenes/contract/index.jsx`) | les champs libres du contrat (saisis par la structure) étaient injectés en HTML, `<a href>` compris : un responsable pouvait placer un lien arbitraire sur la page officielle de signature | les champs sont rendus comme du texte |

L'écriture des jetons par le client était déjà fermée (`validateContract` les retire, cf. C2) ; un contrat
renvoyé sans jetons par l'admin conserve ceux qui existent (test dédié).

## Démonstration

`api/src/__tests__/contract.test.ts` : les trois nouveaux tests (jetons absents de la réponse de
POST /contract pour un mineur et un majeur, absents de GET /contract/:id pour un référent) échouent sur
l'ancien code parce que les jetons sont présents dans la réponse.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `api` — `contract.test.ts` + `young-security.test.ts` | 67/67 (le premier test de `contract.test.ts` échoue par intermittence au démarrage à froid, vert en relance) |
| `eslint` sur les fichiers modifiés (api, admin, app) | 0 erreur |

## Après déploiement

Les jetons déjà lus par des responsables restent valides tant que la signature n'est pas faite : un
jeton n'est régénéré que si l'email du signataire change ou si sa signature était déjà validée. Une
régénération des jetons des contrats en attente (suivie d'un renvoi des emails) n'est pas faite ici ;
elle est à décider avec les contrôles post-déploiement.
