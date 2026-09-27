# Lot P32 — Journaux applicatifs sans jetons ni PII (api, apiv2, snupport-api)

Audit de sécurité de la production du 25/09/2026, constats PL6, PL14, PL16 et PL20
(ticket Linear GOO-86). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PL6 | faible | Toutes les routes api v1 (`loggingMiddleware`, log des routes `/public` de `authMiddleware`) | L'IP journalisée vient désormais de `req.ip` (Express, fiable grâce à `app.set("trust proxy", config.TRUST_PROXY_HOPS)`, déjà en place et déjà utilisé par le rate limiting) au lieu de `req.ipInfo`, calculée par le package `request-ip` (`requestIp.getClientIp`) : cette fonction fait confiance à `X-Client-IP` ou au premier `X-Forwarded-For` sans validation de la chaîne de proxies, donc falsifiable par le client. Le middleware qui posait `req.ipInfo` dans `api/src/main.js` est supprimé. |
| PL14 | faible | Worker email apiv2 (`EmailBrevoProvider.send`, appelé par la queue de notification) | Suppression du `console.log(EmailBrevoProvider.name, template, emailParams)` qui journalisait en clair, à chaque envoi, les destinataires et toutes les variables de template (PII) passées à Brevo. |
| PL16 | faible (régression de H77) | `LoggerRequestMiddleware` (apiv2), monté sur toutes les routes (`App.module.ts`) | `originalUrl` passe désormais par `redactUrl` (`@snu/log-redaction`, déjà consommée ailleurs dans apiv2 par `AllExceptionsFilter`) avant journalisation, au lieu d'être écrite brute. Referme le vecteur du jeton HMAC de `POST /v2/plan-marketing/import/webhook?token=<hmac>`, ainsi que tout autre secret porté par une query string ou un segment de chemin sensible. |
| PL20 | faible (résiduel de H55) | Toutes les requêtes snupport-api (`morgan`) ; ingestion IMAP (cron `*/30 * * * *`, `addMessage`) | `morgan("dev")` écrit désormais dans un stream (`snupport-api/src/utils/morganLogStream.js`) qui route chaque ligne d'accès vers le logger winston existant (niveau `http`), donc à travers la redaction `@snu/log-redaction` déjà en place pour le reste de l'application, au lieu d'écrire directement sur la console. Dans `addMessage` (`imap.js`), le `console.log("error fetching mail : ", mail)` du bloc `catch` ne journalise plus l'objet mail complet (sujet, corps texte/HTML, pièces jointes, adresses from/to/cc) mais uniquement `mail?.messageId`, un identifiant sans PII déjà utilisé ailleurs dans le fichier à des fins de diagnostic. |

## 2. Choix

- **`req.ip` plutôt qu'une correction du calcul de `req.ipInfo`** : `trust proxy` est déjà configuré
  correctement dans `api/src/main.js` (`config.TRUST_PROXY_HOPS`) et déjà utilisé sans problème par
  le rate limiting des routes d'auth (`api/src/middlewares/rateLimit.ts`). `req.ipInfo` et le package
  `request-ip` n'apportaient rien que `req.ip` ne couvre pas déjà de façon fiable ; les supprimer élimine
  le vecteur au lieu de le corriger. La dépendance `request-ip` (`package.json` racine) n'a pas été
  retirée du `package.json`/`package-lock.json` dans ce lot : elle n'est plus utilisée mais son retrait
  aurait nécessité une régénération du lockfile, risquée dans un worktree (voir `CLAUDE.md`, section
  isolation) pour un lot de taille S sans lien avec la sécurité elle-même ; à faire dans un lot de
  nettoyage de dépendances.
- **`logger.http` plutôt qu'un nouveau niveau ou un filtre ad hoc pour morgan** : le niveau `http` est
  déjà défini dans `snupport-api/src/logger.ts` (`LEVELS`) mais n'était utilisé nulle part ; il est fait
  pour exactement cet usage (logs d'accès HTTP) et hérite gratuitement du format existant (redaction +
  format simple/coloré selon l'environnement) sans dupliquer de logique.
- **Aucun changement du format `morgan("dev")` lui-même** : seul le transport change (stream vers
  winston au lieu de stdout direct) ; le format des lignes d'accès (et donc tout ce qu'un opérateur
  regarde aujourd'hui dans les logs snupport-api) reste identique, à la redaction près.
- **`mail?.messageId` plutôt que la suppression totale du log d'erreur** : conserver un identifiant
  permet toujours de retrouver le message en base (`MessageModel.findOne({ messageId })`) pour
  diagnostiquer une erreur de traitement IMAP, sans jamais exposer son contenu.

## 3. Impact fonctionnel

Très faible : aucun de ces quatre correctifs ne change de comportement métier ni de réponse HTTP,
seulement le contenu et le transport des journaux applicatifs.

- api : le rate limiting et tout usage applicatif de l'IP client restent inchangés (ils utilisaient
  déjà `req.ip`) ; seul le champ `ip` des journaux d'accès et d'oracle change de source.
- apiv2 : aucun changement de comportement d'envoi d'email (Brevo) ni de traitement du webhook
  plan-marketing.
- snupport-api : aucun changement du traitement des mails entrants ni des tickets créés ; seul le
  contenu du journal d'erreur change en cas d'échec de traitement d'un mail.

## 4. Tâches post-déploiement

- Déploiement : `api`, `apiv2` et `snupport-api`, sans ordre entre eux (confirmé par l'audit).
- Vérifier après déploiement que les journaux d'accès `api` (`loggingMiddleware`, log `"api"`)
  portent bien une IP cohérente avec les requêtes réelles (pas de régression sur le rate limiting ou
  les tableaux de bord d'abus qui liraient ce champ).
- Vérifier que les journaux d'accès `snupport-api` (niveau `http`) apparaissent bien dans le volume
  de logs attendu : `LOG_LEVEL` n'est fixé nulle part dans `devops/` pour cette app (défaut `debug`,
  qui inclut `http`) ; si une variable d'environnement Clever Cloud règle `LOG_LEVEL` plus strictement
  en production, les lignes d'accès disparaîtraient silencieusement.
- Suivi possible, hors périmètre de ce lot : retirer la dépendance `request-ip`, désormais inutilisée,
  du `package.json` racine et du lockfile.
