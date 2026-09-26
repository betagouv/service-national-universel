# Lot P14 — Sentry : redaction des transactions, jetons de confiance et erreurs

Audit de sécurité de la production du 25/09/2026, constats PH18, PH26 (élevée) et PM36 (moyenne)
(ticket Linear GOO-67). Vérifié ouvert puis corrigé le 2026-09-26 sur `origin/main` @ `bec7704ea`.
Partie « P14a » du lot d'origine (haute sévérité) ; les corrections de journaux applicatifs
(PL6/PL14/PL16/PL20) sont un lot distinct (P32, GOO-86).

## 1. Constats et correctifs

| Constat | Surface | Avant | Après |
| --- | --- | --- | --- |
| PH18 | Toutes les routes api v1, apiv2 (`/v2/*`) et snupport-api (transactions de performance échantillonnées) | `beforeSend: redactSentryEvent` était posé partout, mais **pas** `beforeSendTransaction` : les transactions Sentry ne passent jamais par `beforeSend` (SDK). Chaque requête échantillonnée partait avec cookies de session, en-têtes et corps de requête en clair | `beforeSendTransaction: redactSentryEvent` ajouté aux 3 initialisations (`api/src/sentry.js`, `apiv2/src/infra/shared/Sentry.provider.ts`, `snupport-api/src/sentry.js`) |
| PH18 (volume) | `SENTRY_TRACING_SAMPLE_RATE` (api) | Défaut `1` dans `config.ts`, avec un repli `|| 0.01` dans `sentry.js` qui camouflait la vraie valeur (100 % si la variable n'est pas posée) | Défaut abaissé à `0.01` dans `config.ts`, repli retiré de `sentry.js` — aligné sur apiv2 et snupport-api, déjà à `0.01` |
| PH26 | Cookie `trust_token-<id>` (jeton de confiance 2FA, posé sur `.snu.gouv.fr`) | `isSensitiveKey` ne testait que `endsWith("token")`/`startsWith("token")` : `trust_token-<id>` normalisé (`trusttoken<hex>`) n'est ni l'un ni l'autre une fois l'id concaténé — échappait à toute redaction, dans les 3 services | `isSensitiveKey` teste désormais `includes("token")` (le garde `hasNonSecretSuffix` reste le filet contre les dates/compteurs) |
| PM36 | `exception.values[].value` (ex. `MongoServerError` "dup key: { email: ... }") | Le message d'erreur brut n'était jamais passé dans `redactString` | `redactSentryEvent` redacte désormais chaque `exception.values[].value` |
| PM36 | `request.data` (corps de requête) | Redacté champ par champ, par nom de clé reconnu : un champ métier non reconnu (adresse, santé, texte libre) restait en clair, comme documenté dans l'avertissement du module lui-même | `request.data` est supprimé entièrement plutôt que redacté sélectivement |
| PM36 | `_original` (mongoose-patch-history, mais aussi `ValidationError.original` de Joi) | Recursé champ par champ comme le reste — un champ non reconnu du document/corps d'origine restait en clair | `"original"` ajouté à `EXPLICIT_SENSITIVE_KEYS` : la valeur entière est masquée en bloc |
| PM36 | Attributs de span OTel `http.url` / `http.target` (transactions) | `isUrlKey` ne couvrait pas ces clés : l'URL complète (chemin + query string) d'un span restait en clair, y compris dans les jetons portés en segment de chemin | `http.url`/`http.target` (normalisés `httpurl`/`httptarget`) ajoutés à `URL_KEYS` ; `"spans"` ajouté aux clés top-niveau parcourues par `redactSentryEvent` |
| PM36 | `Handlers.requestHandler()` (snupport-api, style legacy Sentry v7) | Joint par défaut le corps, les en-têtes et les cookies bruts à chaque transaction, **avant** `beforeSendTransaction` | Restreint à `{ request: ["method", "url"] }` |

## 2. Choix

- Scindé du lot d'origine : ce PR ne couvre que PH18/PH26/PM36 (le cœur sécurité, haute sévérité).
  Les 4 correctifs de journaux applicatifs (IP falsifiable, `console.log` d'apiv2/snupport-api, jeton
  webhook loggué en clair) partent dans un lot séparé, faible sévérité, déployable indépendamment
  (P32, GOO-86).
- `request.data` est supprimé plutôt que redacté champ par champ : le module `log-redaction`
  documente lui-même qu'il ne peut pas reconnaître une PII métier sans nom de clé reconnaissable — une
  redaction sélective laisse structurellement passer tout champ non prévu.
- Les fronts (`sentryFront`) ne sont pas touchés : seul le comportement des 3 backends change.

## 3. Fichiers touchés

`packages/log-redaction/src/index.ts`, `api/src/sentry.js`, `api/src/config.ts`,
`apiv2/src/infra/shared/Sentry.provider.ts`, `snupport-api/src/sentry.js`.

## 4. Tests

- `packages/log-redaction/src/__tests__/index.test.ts` : `trust_token-<id>` et `_original`/`original`
  ajoutés à la liste des clés sensibles ; nouveaux describe `isUrlKey` (http.url/http.target) et
  `redactSentryEvent` (request.data supprimé, spans redactés, exception.values redacté, cookie
  trust_token masqué). Un test existant (`_original` d'une ValidationError Joi) est mis à jour pour
  refléter le nouveau masquage en bloc.
- `api/src/__tests__/sentry-redaction.test.ts` : nouveau cas `beforeSendTransaction` ; les deux cas
  existants qui vérifiaient un masquage champ par champ de `request.data` sont mis à jour (`data`
  désormais absent).
- `apiv2/test/shared/Sentry.provider.spec.ts` : nouveau cas `beforeSendTransaction`.
- `snupport-api/src/__tests__/sentry-redaction.test.ts` : nouveaux cas `beforeSendTransaction` et
  options de `Handlers.requestHandler()` ; le cas existant est mis à jour (idem `request.data`).
- RED vérifié en stashant isolément `packages/log-redaction/src/index.ts` puis les 3 fichiers de
  wiring Sentry : chaque test échoue exactement comme décrit sur le code d'avant correctif.
- Régression : `logging-middleware.test.ts` (winston, `redactLogInfo`) vert — le passage de
  `isSensitiveKey` à `.includes("token")` ne crée pas de faux positif sur les clés déjà testées.
  `tsc --noEmit` propre sur `api` et `apiv2`.

## 5. Après déploiement

- Contrôler sur Sentry que les nouvelles transactions ne portent plus ni cookies ni corps de requête.
- Décider avec le DPO de la purge des événements déjà stockés (JWT, `trust_token` postérieurs au
  08/09/2026, `request.data` des transactions).
- Vérifier `SENTRY_TRACING_SAMPLE_RATE` sur les apps Clever de l'api : si la variable n'était pas
  posée explicitement, l'échantillonnage passe de fait de 100 % à 1 %.
