# Lot V08a : changement d'email d'un volontaire (GOO-170)

Première PR du lot V08 (identité, sessions et verrous des validateurs). Périmètre : `api` seul,
changement d'email en libre-service d'un volontaire, et réponses des routes de validation de code.

## 1. Corrigé

| Surface | Correctif |
| --- | --- |
| `GET /young/email-validation/token` (`requestNewEmailValidationToken`) | Le code est envoyé à la nouvelle adresse quand un changement est en cours, à l'adresse du compte sinon (validation d'un compte non encore validé : inchangé). Rien n'est plus envoyé à l'adresse actuelle pendant un changement. |
| `POST /young/email` (`requestEmailUpdate`) | Le mot de passe est compté comme sur `reset_password` : verrou lu, essai consommé atomiquement avant la comparaison, `TOO_MANY_REQUESTS` au-delà du plafond, compteur remis à zéro après un mot de passe juste. Mêmes helpers (`isLoginLocked`, `consumeLoginAttempt`, `resetLoginAttempts`), mêmes codes de réponse, aucun nouveau message. |
| `POST /young|referent/signin-2fa`, `POST /young/email-validation`, `POST /young/email-validation/new-email` | Un code expiré, un compte inconnu et un plafond d'essais atteint répondent la même chose (400 `PASSWORD_TOKEN_EXPIRED_OR_INVALID`) qu'un mauvais code, au lieu d'une erreur 500 pour les trois premiers cas. |

## 2. Choix

- **Statut HTTP du verrou sur `POST /young/email`** : 400, comme la réponse `PASSWORD_INVALID` déjà
  renvoyée par cette route, et non 401 comme `reset_password`. Les clients traitent un 401 comme une
  session expirée ; le code applicatif et le corps (`TOO_MANY_REQUESTS`, `nextLoginAttemptIn`) sont
  ceux de `reset_password`, seul le statut HTTP diffère. Côté front, ce code n'est pas encore géré
  sur cette route (message générique) : à traiter dans le lot front.
- **Réponses uniformes** : la cause de l'erreur 500 était le hook post-update de
  `mongoose-patch-history`, qui lit le document rendu par `findOneAndUpdate` et lève quand il est
  vide. La consommation d'un essai passe désormais par le driver natif (les hooks de l'historique de
  patch ne sont pas joués), puis le document est relu. Les compteurs sont exclus de l'historique de
  patch : aucune trace n'est perdue. Seul `updatedAt` n'est plus modifié par un essai de code. Le plafond, l'échéance et l'incrément restent dans une seule
  opération atomique, la garantie sous concurrence est inchangée (vérifiée par test sous rafale).
  Cette voie a été préférée à la capture de l'exception du hook, qui aurait masqué d'autres erreurs.

## 3. Hors périmètre

Le périmètre du contrôle d'unicité de l'adresse email n'est pas modifié par ce lot.

## 4. Tests

`api/src/__tests__/young-email-update.test.ts` : destinataire du code (nouvelle adresse, adresse du
compte pour un compte non validé), plafond de 3 essais sous rafale, compteur et verrou du mot de passe
sur `POST /young/email`, réponse identique sur les trois routes de validation (code expiré, compte
inconnu, plafond dépassé, mauvais code), et non-régression d'un code juste.
