# Lot P18 — snupport-api : connexion des agents

Audit de sécurité de la production du 25/09/2026, constats PM42, PM43 et PL17
(ticket Linear GOO-76). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

PL2 (`api/src/controllers/signin.js`, référent `INACTIVE`), mentionné dans le brouillon
initial du lot, était déjà fermé par le lot P24 (GOO-56/#5371) — non repris ici.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM42 | moyenne | `POST /agent/signin`, `POST /agent/forgot_password`, `POST /agent/forgot_password_reset` (snupport-api) | les trois échecs distincts de `/signin` (email inconnu, mot de passe jamais défini, mauvais mot de passe) répondent désormais tous `401 EMAIL_OR_PASSWORD_INVALID` ; `/forgot_password` répond toujours `200 { ok: true }`, que le compte existe ou non ; un limiteur de débit en mémoire (IP + email) est monté sur les trois routes |
| PM43 | moyenne | `POST /agent/signin` et `POST /agent/forgot_password` (snupport-api) | un compte `REFERENT_DEPARTMENT`/`REFERENT_REGION` ne peut plus se connecter par mot de passe ni s'en attribuer un via « mot de passe oublié » — ces comptes ne s'ouvrent que par SSO (`GET /v0/sso/signin`) ; défense en profondeur sur `/forgot_password_reset` pour un jeton émis juste avant le déploiement |
| PL17 | faible | `GET /agent` (snupport-api) | réservé à `requireRole("AGENT")` ; son seul appelant (`ventilationAutomation.jsx`) est déjà réservé à ce rôle côté front |

## 2. Choix

- **Un seul point de sortie d'échec pour `/signin`** (`invalid()`) : les trois branches (email
  inconnu, mot de passe non défini, mauvais mot de passe) et le refus d'un rôle référent
  convergent vers la même réponse, pour qu'aucune d'elles ne distingue par erreur un cas d'un
  autre à l'avenir.
- **Le refus du rôle référent est vérifié avant toute lecture du mot de passe** (`AgentModel.findOne`
  suffit) : un compte référent authentique n'a jamais accès à cette voie, avec ou sans bon mot de
  passe — c'est le SSO qui l'authentifie, identifié par `snuReferentId` (`ssoAgent.js`).
- **`REFERENT_ROLES` dupliqué localement dans `agent.js`**, plutôt que partagé : la constante
  existe déjà, dupliquée à l'identique, dans `utils/ticketUpdate.js` et
  `controllers/v0/referent.js`, et aucun des trois fichiers n'exportait la sienne avant ce lot ;
  suivre le même patron évite d'introduire un import croisé pour une liste de deux littéraux.
- **Limiteur de débit maison (`middlewares/rateLimit.ts`), sans nouvelle dépendance** :
  contrairement à `api`, `snupport-api` n'a ni `express-rate-limit`, ni `rate-limit-redis`, ni
  client Redis (vérifié : absents de `package.json` et de `config.ts`). Le compteur est une `Map`
  en mémoire par process, à fenêtre fixe, clé `prefix:ip:email` (repli sur l'IP seule si la
  requête ne porte pas d'email, cas de `/forgot_password_reset`) ; `resetRateLimiters()` est
  exporté pour l'isolation des tests. Un seul process pour snupport-api aujourd'hui : passer à un
  backend partagé (Redis) le jour où ce ne sera plus le cas.
- **`/forgot_password_reset` : défense en profondeur, pas une fermeture indépendante** — puisque
  `/signin` bloque déjà le rôle référent, seul un jeton émis dans la fenêtre résiduelle
  (`RESET_TOKEN_MAX_AGE_MS`, 1 h) juste avant le déploiement pourrait encore aboutir ; le
  correctif renvoie la même réponse `400 PASSWORD_TOKEN_EXPIRED_OR_INVALID` qu'un jeton invalide,
  pour ne rien laisser filtrer sur l'existence ou le rôle du compte.
- **`GET /agent` limité à `AGENT`, pas `AGENT`+`DG`** : seul l'écran de ventilation l'appelle, et
  cet écran est déjà réservé à `AGENT` côté front (`snupport-app/src/scenes/setting/index.jsx`) ;
  aucun usage légitime perdu pour DG ou les référents.

## 3. Impact fonctionnel

- Un référent départemental ou régional ne peut plus se connecter à `support.snu.gouv.fr` avec un
  mot de passe, ni en obtenir un via « mot de passe oublié » : sa seule voie d'accès reste le SSO
  déjà en place (redirection depuis la plateforme SNU). Aucun impact pour les comptes `AGENT`/`DG`.
  Aucune perte pour un usage légitime : ces comptes n'ont jamais eu de mot de passe fonctionnel
  destiné à un usage courant (provisionnés par la synchronisation `syncReferentSupport`).
- Un attaquant qui teste des emails sur `/agent/signin` ou `/agent/forgot_password` ne peut plus
  distinguer un compte existant d'un compte inexistant par le code ou le statut HTTP renvoyé.
- Un pic de tentatives (script de brute force, energie ou erreur cliente en boucle) reçoit un
  `429 TOO_MANY_REQUESTS` passé le quota (20 / 15 min pour `/signin`, 10 / h pour
  `/forgot_password` et `/forgot_password_reset`, par IP + email) au lieu d'être traité
  indéfiniment.
- `GET /agent` (annuaire complet des agents) n'est plus accessible à un référent ou à DG ; seul
  l'écran de ventilation (réservé à `AGENT`) l'utilisait.

## 4. Tâches post-déploiement

- Déploiement : `snupport-api` seul.
- Aucune migration, aucune variable d'environnement nouvelle.
- Le compteur du limiteur de débit vit en mémoire, par process : il repart à zéro à chaque
  redéploiement ou redémarrage — comportement attendu, pas une régression.
- Optionnel, comme suggéré par l'audit : purger `password` et `forgotPasswordResetToken` des
  comptes `REFERENT_DEPARTMENT`/`REFERENT_REGION` existants, et rechercher les comptes référents
  dont `passwordChangedAt` est renseigné (signe d'une réinitialisation déjà utilisée avant ce
  correctif).
