# Lot C — anti-abus des routes d'authentification

Audit du 2026-09-21. Constats vérifiés sur `origin/main` (`52da8d58e`), correctifs portés et
revérifiés sur `origin/main` (`8c8f9a7cc`) dans un worktree isolé. Aucun des fichiers concernés n'a
bougé entre les deux, sauf `referentController.ts` (le correctif H69/H68/M68 a été mergé entre-temps,
#5339) et `api/package.json`.

| Id | Objet | Vérification | Statut |
|---|---|---|---|
| M42 / M65 | Aucun rate limiting sur les routes d'auth | confirmé | **corrigé** |
| M4 | Brute force du mot de passe par requêtes concurrentes | confirmé | **corrigé** |
| M5 | Contournement du plafond de 3 essais 2FA | confirmé | **corrigé** |
| L3 | Contournement du plafond `attemptsEmailValidation` | confirmé (2 routes) | **corrigé** |
| L27 | Remise à zéro quotidienne des compteurs par le cron | confirmé | **corrigé** |
| L21 | `GET /signin/token` accepte les comptes supprimés | confirmé | **corrigé** |
| M6 | Oracle d'existence d'email côté jeune | confirmé (2 routes) | **corrigé** |
| M3 | Oracle à l'inscription | confirmé | **corrigé** — route fermée, voir § M3 |
| — | `POST /young/check_password` : même TOCTOU que M4, hors audit | constaté en relisant | **corrigé** |

Le lot est bien entier : aucun merge intermédiaire n'a touché ces neuf entrées. La PR #5325 a lié le
trust token au compte, sans rien changer aux compteurs ni au rate limiting.

## Démonstration

`api/src/__tests__/auth-anti-abus.test.ts`, 13 cas. Sur `origin/main`, 8 des 9 cas écrits avant la
fermeture de `/young/signup` échouent. Les valeurs observées, et non seulement le fait qu'elles
soient fausses, sont le cœur du constat :

| Cas | Attendu | Observé sur `origin/main` |
|---|---|---|
| 10 signin concurrents avec un mauvais mot de passe | `loginAttempts = 10` | **1** |
| 11ᵉ tentative après la rafale | `TOO_MANY_REQUESTS` | `EMAIL_OR_PASSWORD_INVALID` |
| 10 codes 2FA faux concurrents | `attempts2FA = 3` | **1** |
| 10 codes de validation d'email faux concurrents | `attemptsEmailValidation = 3` | **1** |
| `GET /signin/token` avec un compte `DELETED` | `401` | `200` + profil |
| `GET /signin/token` avec un compte anonymisé | `401` | `200` + profil |
| `POST /young/email`, mauvais mot de passe, email existant | pas d'`EMAIL_ALREADY_USED` | `409 EMAIL_ALREADY_USED` |
| 25 signin depuis la même IP | un `429` | `[401 × 25]` |

Le « 1 » est le point important. Avec un « lire, incrémenter, sauver », les N requêtes concurrentes
lisent toutes la même valeur et la dernière écriture écrase les autres : le compteur ne finit pas à N,
il finit à 1. Le plafond annoncé n'est donc pas « 3 essais », c'est « 3 *vagues* de N essais ».

Pour le 2FA (`crypto.randomInt(1000000)`, `auth.ts:488`), cela fait 3 × N codes testables par code
émis, au lieu de 3 — et rien n'empêchait de relancer un signin pour obtenir un code neuf, puisque
`signin` n'était pas non plus limité.

## Correctifs

### Compteurs atomiques (M4, M5, L3)

`api/src/services/auth/attemptCounters.ts`. Chaque « lire, incrémenter, sauver » est remplacé par un
`findOneAndUpdate` conditionnel : MongoDB sérialise les écritures sur un même document, donc N
requêtes concurrentes obtiennent N valeurs distinctes.

Pour le 2FA et la validation d'email, le filtre porte le plafond (`attempts2FA: { $lt: 3 }`) et
l'incrément est dans la même opération : au-delà du plafond, plus aucune requête ne matche.

Pour la connexion, l'atomicité de l'incrément ne suffisait pas. Le contrôle de plafond et la
comparaison bcrypt étaient séparés par ~100 ms : N requêtes concurrentes franchissaient toutes le
contrôle avant que la première n'écrive. **La tentative est donc consommée avant bcrypt**, et c'est
la valeur renvoyée par l'update qui décide.

Deux états sont distingués, pour ne pas durcir l'expérience au passage :

- `blocked` (au-delà de 12) : refus sans comparer le mot de passe. C'est ce qui borne le nombre de
  hachages qu'une rafale peut déclencher — 12 par fenêtre de 60 s et par compte, au lieu d'un nombre
  illimité.
- `delayed` (au-delà de 5) : un délai est posé pour la tentative *suivante*, mais celle en cours est
  évaluée normalement. Un utilisateur qui finit par taper le bon mot de passe à son 6ᵉ essai se
  connecte, comme avant le correctif.

Un mot de passe correct purge le compteur immédiatement, y compris quand le parcours se poursuit en
2FA, pour qu'un utilisateur qui relance plusieurs fois sa connexion ne se verrouille pas lui-même.

### Expiration par compte (L27)

`api/src/crons/loginAttempts.js` remettait à zéro le compteur de **tous** les comptes chaque nuit à
1 h (`crons/index.js:87`, `0 1 * * *`) : le blocage dur à 12 ne tenait jamais plus d'une journée, et
un attaquant n'avait qu'à attendre une horloge commune et connue.

L'expiration est désormais portée par chaque compte, via une fenêtre glissante de 2 h dans
`consumeLoginAttempt` : hors fenêtre, le compteur repart de 1 à la tentative suivante. Le cron ne
fait plus que de l'entretien — il efface les compteurs déjà hors fenêtre, ce qui n'accorde aucune
tentative que la fenêtre glissante n'accorderait pas.

Le blocage dur expire maintenant après 1 h sans tentative, au lieu de « jusqu'à 1 h du matin ». C'est
un choix : un blocage sans expiration transformerait la connaissance d'une adresse email en
verrouillage de compte à volonté.

### Rate limiting (M42 / M65)

`api/src/middlewares/rateLimit.ts`, `express-rate-limit` adossé au Redis déjà présent
(`config.REDIS_URL`). Sans Redis (dev, tests), le compteur retombe en mémoire locale.

| Routes | Quota par IP |
|---|---|
| `signin`, `signin-2fa`, `forgot_password_reset`, `signup_verify` | 20 échecs / 15 min |
| `forgot_password`, `signup_retry`, `email-validation/token`, `signup/email`, `young/email` | 10 / h |

`POST /young/signup` n'a pas de quota : elle est fermée (voir § M3).

Les routes de connexion utilisent `skipSuccessfulRequests` : seules les tentatives refusées
consomment du quota.

Deux points d'attention :

- `app.set("trust proxy", config.TRUST_PROXY_HOPS)` a été ajouté dans `main.js`. Sans cela, `req.ip`
  désigne le reverse proxy et le quota se contourne en forgeant `X-Forwarded-For`. La valeur par
  défaut est 1 en production/staging/ci/custom, 0 en local ; **à revérifier si la chaîne de proxies
  a plus d'un saut**, sinon le quota se contourne toujours.
- Les limiteurs sont instanciés au chargement des modules de routes, donc partagés par tout le
  process. C'est le comportement voulu en production, mais cela fuit entre cas de test :
  `resetRateLimiters()` est appelé depuis `resetAppAuth()`, déjà présent dans les `afterEach`.

### Comptes supprimés (L21)

`controllers/signin.js` vérifiait `passwordChangedAt` et `lastLogoutAt` mais ni `status: DELETED`,
ni `anonymized`, ni `deletedAt` — contrairement à `passport.ts:56`. Le contrôle est ajouté sur les
deux branches (jeune et référent).

### Oracle d'email (M6)

`requestEmailUpdate` cherchait l'email visé **avant** de vérifier le mot de passe. Les deux appels
sont inversés. La route servait d'oracle d'existence de compte à tout jeune authentifié, sans même
qu'il ait à connaître son propre mot de passe.

`changeEmailDuringSignUp` porte le même 409, mais n'a pas de mot de passe à vérifier : elle est
seulement soumise au quota de 10/h.

## M3 — route fermée

`auth.ts:193` (volontaire) et `:320` (CLE) renvoyaient `409 USER_ALREADY_REGISTERED` quand le triplet
prénom / nom / date de naissance existait déjà : cela confirme anonymement qu'une personne est
inscrite.

Uniformiser le code d'erreur n'aurait rien fermé. Sur une route d'inscription publique, l'oracle
n'est pas le code renvoyé, c'est la distinction « compte créé » / « compte pas créé » — elle reste
observable quelle que soit la réponse. Le seul vrai correctif est de ne plus servir la route.

C'est possible, parce qu'elle n'a plus d'appelant :

- `app/src/app.jsx:88` route `/preinscription` vers un redirect externe
  (`snu.gouv.fr/inscriptions-cloturees`) ;
- les deux seuls appels à `POST /young/signup` du dépôt sont
  `app/src/scenes/preinscription/steps/stepProfil.jsx:157` et `stepConfirm.jsx:110`, tous deux sous
  ce chemin mort ;
- `stepConfirm.jsx` portait les deux branches (volontaire et CLE, via `source`), donc la branche CLE
  est morte elle aussi — `/je-rejoins-ma-classe-engagee` reste routé mais ne passe pas par `signup`.

`POST /young/signup` renvoie donc `403 OPERATION_NOT_ALLOWED`, exactement comme `POST /referent/signup`
le fait déjà. `signupVolontaire` et `signupCLE` sont conservés intacts dans `auth.ts`.

**À rouvrir explicitement quand les inscriptions reprennent**, et à ré-armer d'un rate limiter à ce
moment-là. La porte de cohorte de `signupVolontaire` (`getFilteredSessions`) reste en place et ne
suffit pas à elle seule : c'est la fermeture de la route qui referme l'oracle.

## État de la vérification

Sous Node 20.20.2, `--maxWorkers=1` (les conditions de `npm test`) :

| Suite | Résultat |
|---|---|
| `auth-anti-abus.test.ts` (lot C) | 13 passés / 13 |
| `young-auth.test.ts`, `referent-auth.test.ts`, `auth-2fa-trust-token.test.ts` | 55 passés, 2 skipped, 0 échec |
| `npm run check-types` | seules les 2 erreurs préexistantes (`ligneDeBusService.test.ts`, `inscription-goal.test.ts`, non touchées) |
| `eslint` sur les fichiers modifiés | 0 erreur, 67 warnings (tous du style déjà en place : `any`, `@ts-ignore`) |

Ces trois suites doivent être lancées **en série**. Lancées en parallèle, elles se perturbent
mutuellement (6 échecs constatés) — c'est pour cela que `npm test` porte `--maxWorkers=1`.

## Limite de la vérification

Le poste tourne en Node 26 alors que le projet exige `^20.17` : `jsonwebtoken` y casse au chargement
(`SlowBuffer` retiré du runtime), donc **aucune suite touchant au JWT ne peut s'exécuter**, y compris
celles qui préexistent. Les résultats ci-dessus ont été obtenus sous Node 20.20.2
(`brew --prefix node@20`).
