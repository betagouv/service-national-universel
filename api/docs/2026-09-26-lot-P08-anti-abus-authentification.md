# Lot P08 — api + apiv2 : anti-abus de l'authentification et clés de limitation

Audit de sécurité de la production du 25/09/2026, constats PM5, PM6, PM26, PM31, PM40, PM41 (moyenne)
et PL3 (faible), résiduels de M4/M42 (ticket Linear GOO-72). Vérifié ouvert puis corrigé le
2026-09-26 sur `origin/main`.

## 1. Constats et correctifs

| Constat | Route / fichier | Avant | Après |
| --- | --- | --- | --- |
| PM5 | `POST /young\|referent/signin` (`api/src/auth.ts`) | Un email inconnu renvoyait toujours `EMAIL_OR_PASSWORD_INVALID` sans bcrypt ; un compte verrouillé renvoyait `TOO_MANY_REQUESTS` **avant** toute comparaison de mot de passe (aucun bcrypt non plus). Les deux se distinguaient donc à la fois par le code et par le temps de réponse dès la 6ᵉ tentative sur un compte réel. | Un hash bcrypt factice (coût 10, identique aux vrais mots de passe) est comparé pour un email inconnu **ou** un compte verrouillé, avant de répondre. `TOO_MANY_REQUESTS` n'est renvoyé que si le mot de passe soumis est **effectivement correct** ; un mot de passe faux reste `EMAIL_OR_PASSWORD_INVALID`, verrouillé ou non — seul le titulaire réel, qui connaît son mot de passe, apprend qu'il est temporairement bloqué |
| PM5 (temps de réponse) | `forgot_password` (`auth.ts`), `referent/signup_retry` (`sendNewInvitation`) | L'appel Brevo (HTTPS synchrone) était attendu avant de répondre, seulement pour un compte existant : écart de plusieurs centaines de ms | L'envoi Brevo n'est plus attendu (`.catch(capture)`, sans `await`) : la réponse revient au même rythme, compte existant ou non |
| PM6 | `POST /young\|referent/reset_password` (`auth.ts`) | Aucun compteur ni verrou sur le mot de passe **courant** : une session volée ou une XSS pouvait le brute-forcer sans limite | Même verrou que `checkPassword` (`isLoginLocked` + `consumeLoginAttempt` avant bcrypt, `resetLoginAttempts` après succès) |
| PL3 | `POST /young/signup_verify`, `POST /young/signup_invite` | Aucun rate limiter (contrairement à `referent/signup_verify`) | `youngSigninLimiter` posé sur les deux routes |
| PM31 | `POST /young\|referent/signup_invite` | Acceptait un corps `x-www-form-urlencoded` : un formulaire tiers pouvait activer un compte et poser une session (login CSRF résiduel, FM2) | `requireJsonBody` posé, comme sur `/signin` |
| PM31 | `GET /jeveuxaider/signin` (`api/src/services/jeveuxaider.js`) | Posait le cookie `jwt_ref` sur une simple requête GET dont le jeton est fourni par l'appelant : une balise cachée (`<img>`, `<iframe>`) sur une page tierce, embarquant le jeton de l'attaquant, connectait la victime **au compte de l'attaquant** sans interaction | Rejette (403) toute requête dont `Sec-Fetch-Dest` n'est pas `document` — fail-open si l'en-tête est absent (aucun précédent dans le dépôt) |
| PM26 | `authRateLimiter` (`api/src/middlewares/rateLimit.ts`), `cleUtilisateurOuIp` (`apiv2/src/main.ts`) | La clé de comptage par défaut d'express-rate-limit 7.5.1 est l'IP brute : une adresse IPv6 par requête, sans regroupement par sous-réseau, contourne le quota par rotation d'adresses dans le même bloc | `normaliserIp` (dupliquée api/apiv2, fonction pure testée) regroupe une IPv6 par bloc `/64` ; une IPv4 (ou IPv4-mappée `::ffff:a.b.c.d`) est inchangée. Appliquée par défaut dans `authRateLimiter`, `userRateLimiter` et `cleUtilisateurOuIp` |
| PM40 | `ROUTE_COUTEUSE` (`apiv2/src/infra/security/RateLimit.ts`) | Regex sensible à la casse : `/V2/Export/...` échappait au limiteur des routes coûteuses | Drapeau `i` ajouté |
| PM41 | `cleUtilisateurOuIp` (`apiv2/src/main.ts`) | Ne lisait que l'en-tête `Authorization` ; l'admin s'authentifie surtout par le cookie httpOnly `jwt_ref` (GOO-16) depuis que le JWT n'est plus posé en localStorage — la clé retombait donc systématiquement sur l'IP pour lui, jamais sur son identifiant, malgré le quota "global" et "couteux" censés être par personne | Repli sur le cookie `jwt_ref`, avec la même restriction d'origine que `AddUserToRequestMiddleware.extraireJeton` (extrait en fonction pure testable `jetonCookieAdmin`) |

## 2. Choix

- **PM5 signin** : `TOO_MANY_REQUESTS` ne dépend plus que de l'exactitude du mot de passe, jamais
  de l'état du compteur seul. Le pré-filtrage « compte déjà verrouillé : ne pas consommer de
  nouvelle tentative » (anti auto-extension du verrou) est conservé tel quel ; seule la décision de
  réponse change.
- **PM5 temps de réponse** : queue-fire-and-forget plutôt qu'une vraie file d'attente — suffisant
  pour fermer l'écart mesurable (appel HTTPS Brevo, la partie dominante du delta), sans
  l'infrastructure d'une file dédiée hors du périmètre du lot.
- **PM31 JVA** : correctif isolé dans son propre commit (routes distinctes des autres, aucun fichier
  partagé), fail-open sur `Sec-Fetch-Dest` absent — l'audit ne trouve aucun usage antérieur de cet
  en-tête dans le dépôt, à surveiller après déploiement plutôt qu'à bloquer par défaut.
- **PM26** : normalisation manuelle plutôt que montée d'express-rate-limit en v8 (`ipKeyGenerator`) :
  la version 7.5.1 est épinglée dans les deux `package.json`, une montée de version élargit le risque
  bien au-delà de ce lot.
- **TRUST_PROXY_HOPS** (second volet de PM26) : décision d'infra, pas de code — reste ouvert (cf. §4).

## 3. Fichiers touchés

`api/src/auth.ts`, `api/src/referent/referentController.ts`, `api/src/controllers/young/index.ts`,
`api/src/services/jeveuxaider.js`, `api/src/middlewares/rateLimit.ts`,
`api/src/services/auth/attemptCounters.ts`, `apiv2/src/main.ts`,
`apiv2/src/infra/security/RateLimit.ts`.

## 4. Reste ouvert (décision produit / infra)

- `TRUST_PROXY_HOPS` : à fixer explicitement avec l'équipe WAF d'après le nombre réel de sauts
  (WAF OGo + répartiteur Clever), et à restreindre l'origine Clever aux IP du WAF. Aucun changement
  de code dans ce lot.
- `GET /jeveuxaider/signin` : surveiller les journaux (`jeveuxaider: /signin refusé,
  Sec-Fetch-Dest=…`) après déploiement — l'intégration JVA n'est pas testable localement.

## 5. Tests

- `api/src/__tests__/auth-anti-abus.test.ts` : le test M4 qui figeait « verrouillé → `TOO_MANY_REQUESTS`
  même avec un mauvais mot de passe » est réécrit (bon mot de passe requis pour l'observer) ; nouveaux
  blocs PM5 (oracle email inconnu vs verrouillé, non-blocage Brevo), PM6 (verrou sur reset_password),
  PL3 (rate limiting signup_verify/signup_invite), PM31 (requireJsonBody sur les deux signup_invite).
- `api/src/__tests__/lot-t2-integrations-externes.test.ts` : PM31 JVA — rejet par `Sec-Fetch-Dest`,
  acceptation en navigation de premier niveau, sans casser le test de la happy-path existante
  (fail-open, aucun en-tête).
- `apiv2/src/infra/security/Security.spec.ts` : `normaliserIp` (fonction pure), `estRouteCouteuse`
  insensible à la casse, `jetonCookieAdmin`.
- RED vérifié en stashant l'implémentation (auth.ts, referentController.ts, attemptCounters.ts) :
  les 5 tests PM5/PM6 échouent sur le code d'avant correctif exactement comme décrit (dont 2 tests
  Brevo qui expirent au bout de 120 s, preuve que l'ancien code attend réellement l'appel réseau).
- Régression : `referent-auth`, `young-auth`, `referent-security`, `referent-young-security`,
  `referent`, `sessions-goo-16`, `young`, `invitation-impersonation-security`,
  `AddUserToRequest.middleware.spec` — tous verts. `tsc --noEmit` propre sur `api` et `apiv2`.

## 6. Piège d'environnement rencontré

Ce worktree manquait `.claude/settings.local.json` (non versionné) : `devops/scripts/worktree-setup.sh`
y échoue silencieusement avant de monter les `node_modules` des espaces de travail, et le paquet
`express-rate-limit`/`rate-limit-redis` (absent de la ferme de liens racine, ajouté à `main` après la
création de ce worktree) résolvait alors vers le checkout principal. Corrigé en copiant le fichier
depuis le principal puis en relançant le script ; deux liens manuels ont ensuite comblé l'écart entre
la racine du principal et celle du worktree (voir mémoire [[lot-p08-anti-abus-authentification]]).
