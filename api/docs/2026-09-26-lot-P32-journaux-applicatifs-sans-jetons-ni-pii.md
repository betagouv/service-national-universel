# Lot P32 — Journaux applicatifs sans jetons ni PII (api, apiv2, snupport-api)

Audit de sécurité de la production du 25/09/2026, constats PL6, PL14, PL16, PL20 (faible) (ticket
Linear GOO-86). Scission de P14 (qui garde Sentry : PH18, PH26, PM36). Dépend de P17 (GOO-68) et
P15 (GOO-80), tous deux fusionnés sur `main` avant ce lot. Vérifié ouvert puis corrigé le
2026-09-26 sur `origin/main` @ `1ce8837aa`.

## 1. Constats et correctifs

| Constat | Surface | Avant | Après |
| --- | --- | --- | --- |
| PL6 | Toutes les routes api v1 (log « api » de `loggingMiddleware`, log des routes `/public`) | `req.ipInfo = requestIp.getClientIp(req)` (`api/src/main.js`) retenait l'en-tête `x-client-ip`, puis la première entrée de `x-forwarded-for` — deux valeurs fournies par le client, donc falsifiables ; le rate limiting utilisait déjà `req.ip` (trust proxy), une source différente | `req.ipInfo` et la dépendance `request-ip` retirés ; `loggingMiddleware.js` et le log des routes publiques (`authMiddleware.ts`) journalisent `req.ip`, calculé par Express via `trust proxy`/`TRUST_PROXY_HOPS` — même source que le rate limiting |
| PL14 | Worker apiv2 (`NotificationJobModule`, file « email ») | `console.log(EmailBrevoProvider.name, template, emailParams)` dumpait à chaque envoi les destinataires (e-mail, nom) et, pour les invitations REFERENT_CLASSE, l'URL d'invitation avec son jeton | Remplacé par `this.logger.log()` (Logger Nest) : seuls le template et le nombre de destinataires sont journalisés |
| PL16 | `POST /v2/plan-marketing/import/webhook?token=<hmac>` (journal `LoggerRequestMiddleware`, monté sur toutes les routes apiv2) ; préparation de l'import (`PlanMarketingBrevo.provider.ts`) | Le jeton statique du webhook (HMAC du `JWT_SECRET`, ne change qu'à sa rotation) était écrit en clair à deux endroits : `originalUrl` non redacté dans `LoggerRequestMiddleware`, et `notifyUrl` dans le message de log de `importerContacts()` | `LoggerRequestMiddleware` applique `redactUrl` (le même helper que l'api v1) sur `originalUrl` ; `importerContacts()` applique `redactUrl` sur `notifyUrl` avant de le journaliser |
| PL20 | Toutes les requêtes snupport-api (`morgan`) ; ingestion IMAP (cron `*/30`, `imap.js`) | `morgan("dev")` (`index.ts`) écrivait `req.originalUrl` brut sur stdout, hors du filet de redaction winston (`GET /v0/ticket?email=<email>`, `GET /v0/sso/signin?email=…`) ; `imap.js` faisait `console.log("no ticket found, message" + firstMessage)` et `console.log("error fetching mail : ", mail)`, dumpant respectivement un document `Message` et le mail entrant complet (corps, expéditeur, pièces jointes) | `morgan` remplacé par un middleware dédié (`middlewares/httpLogger.js`) qui journalise via le logger winston avec `redactUrl(req.originalUrl, req.params)` ; les deux `console.log` d'`imap.js` remplacés par `logger.error()` ne portant que `messageId` |

## 2. Choix

- **`req.ipInfo` supprimé plutôt que corrigé** : la seule raison d'être de `request-ip` était de
  fournir une IP côté logs ; `req.ip` (déjà utilisé par `rateLimit.ts`) est calculé par Express avec
  le même réglage `trust proxy`/`TRUST_PROXY_HOPS` que le reste de l'api, donc la même source pour
  les deux usages plutôt que deux mécanismes divergents. La dépendance npm `request-ip` reste
  déclarée dans `package.json` (non retirée : modifier le lockfile dans un worktree est risqué et
  hors du périmètre de ce constat — aucun code ne l'importe plus après ce lot).
- **PL14 ne journalise que le nombre de destinataires**, pas leurs adresses : au moment de l'appel,
  seul le comptage sert au diagnostic (« l'envoi a bien été déclenché pour N destinataires ») ; le
  détail (adresses, template rendu) reste dans Brevo lui-même en cas de besoin d'investigation.
- **PL16 réutilise `redactUrl` de `@snu/log-redaction`** (déjà utilisé par `AllExceptionsFilter` et
  par l'api v1) plutôt que d'écrire une redaction ad hoc pour apiv2 : `redactUrl` masque déjà tout
  paramètre de query dont le nom contient `token` (`isSensitiveKey`), donc `?token=<hmac>` devient
  `?token=**********` sans changement côté `log-redaction`.
- **PL20 : un middleware dédié (`httpLogger.js`) plutôt qu'un simple `format` morgan personnalisé** :
  morgan écrit directement sur son propre flux, indépendant du logger winston et de son filet de
  redaction (`redactLogInfo`) déjà en place pour tous les autres appels `logger.*` de snupport-api.
  Passer par `logger.http()` fait bénéficier la ligne d'accès des deux couches de défense (l'appel
  explicite à `redactUrl`, et le filet `redactLogInfo` du formatteur winston en repli).
- **`imap.js` : seul le `messageId` est conservé**, jamais le document complet — c'est la même
  discipline que la ligne déjà correcte du fichier (`imap: mail ${mail.messageId} non rattaché…`,
  ligne 78), désormais appliquée aux deux autres sites.

## 3. Fichiers touchés

`api/src/main.js`, `api/src/middlewares/loggingMiddleware.js`, `api/src/middlewares/authMiddleware.ts`,
`apiv2/src/notification/infra/email/brevo/EmailBrevo.provider.ts`,
`apiv2/src/shared/infra/LoggerRequest.middleware.ts`,
`apiv2/src/plan-marketing/infra/provider/PlanMarketingBrevo.provider.ts`, `snupport-api/src/index.ts`,
`snupport-api/src/imap.js`, `snupport-api/src/middlewares/httpLogger.js` (nouveau).

Tests : `api/src/middlewares/loggingMiddleware.test.ts` (nouveau), `api/src/middlewares/authMiddleware.test.ts`,
`apiv2/src/notification/infra/email/brevo/EmailBrevo.provider.spec.ts` (nouveau),
`apiv2/src/shared/infra/LoggerRequest.middleware.spec.ts` (nouveau),
`apiv2/src/plan-marketing/infra/provider/PlanMarketingBrevo.provider.spec.ts` (nouveau),
`snupport-api/src/middlewares/httpLogger.test.js` (nouveau), `snupport-api/src/__tests__/imapLogging.test.js` (nouveau).

## 4. Tests

- `loggingMiddleware.test.ts` (nouveau) : le log « api » porte `req.ip`, pas `req.ipInfo`, même
  quand les deux sont présents sur la requête (simule une IP falsifiée côté `ipInfo`).
- `authMiddleware.test.ts` : mis à jour pour exercer `req.ip` sur le log des routes publiques.
- `EmailBrevo.provider.spec.ts` (nouveau) : `send()` n'écrit jamais sur `console.log`, y compris
  avec des destinataires et une URL porteuse d'un jeton dans `emailParams`.
- `LoggerRequest.middleware.spec.ts` (nouveau) : le message journalisé pour un appel webhook Brevo
  ne contient pas le jeton de la query string, mais conserve le chemin.
- `PlanMarketingBrevo.provider.spec.ts` (nouveau) : `importerContacts()` ne journalise jamais le
  jeton porté par `notifyUrl`.
- `httpLogger.test.js` (nouveau) : la requête est journalisée via le logger winston (`logger.http`),
  jamais directement sur `console.log` ; l'email porté par la query string est masqué.
- `imapLogging.test.js` (nouveau) : ni le document `Message` retrouvé, ni le mail entrant complet
  (sujet, corps) ne sont dumpés en cas d'échec — seul l'identifiant du message atteint les journaux.
- Suites complètes relancées en série (Node 20, `--maxWorkers=1`), chaque projet seul (jamais en
  parallèle) : **snupport-api 100 % verte** (50 suites, 517 tests) ; **api 100 % verte** (118 suites,
  1797 tests, 15 skip, 1 todo) ; **apiv2**
  verte à l'exception des mêmes 15 suites déjà documentées dans le lot P15
  (`Cannot find module '@bull-board/nestjs'`, panne d'isolation du worktree préexistante et sans
  rapport avec ce lot) — les 574 tests restants passent, dont les 3 nouveaux fichiers de ce lot.
  `tsc --noEmit` propre côté `api` ; côté `apiv2`, bloqué par le même `@bull-board/nestjs` manquant
  (préexistant) ; côté `snupport-api`, une seule erreur préexistante et sans rapport
  (`contact.ts:81`, confirmée par `git stash` sur l'arbre avant ce lot).

## 5. Risque fonctionnel

Très faible. Aucun de ces quatre correctifs ne change de comportement observable : ce sont des
retraits ou des redactions de journalisation, pas des changements de logique métier. Le seul point
d'attention est que la capacité d'investigation en cas d'incident perd le contenu détaillé
auparavant dumpé (documents complets, adresses) au profit du seul identifiant — compensé par le
fait que ce contenu reste accessible en base (Mongo) via l'identifiant journalisé.

## 6. Après déploiement

Aucune action de suivi. Les quatre correctifs sont autonomes (pas de migration, pas de variable
d'environnement nouvelle) et se déploient sans ordre particulier sur `api`, `apiv2` et
`snupport-api`, comme indiqué par l'audit.
