# Lot A3 — Annuaire référent : oracle d'existence d'email (M70)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-34 · Branche `fix/goo-34-referent-exist-oracle`, base `origin/main` (`9a50ebc53`)

## Contexte

`POST /referent/exist` répond `true` ou `false` selon qu'un email correspond à un compte de la
plateforme. Son seul appelant est le formulaire « Inviter une nouvelle structure » de l'admin : il
vérifie que le futur responsable n'est pas déjà inscrit avant de créer la structure.

## État du constat sur `origin/main`

Ouvert. `canCheckIfRefExist` autorisait `SUPERVISOR` en plus des admins et des référents
régionaux et départementaux, et la route n'avait aucun limiteur. Autre défaut : sans email dans
le corps, la recherche partait sur `{}` et renvoyait `true`.

## Ce qui change

| Id | Avant | Après |
|---|---|---|
| M70 | admin, référents rég./dép. **et superviseurs** ; aucun quota ; email facultatif | admin, référents rég./dép. seulement (403 pour tous les autres, que l'email existe ou non) ; 20 appels / 10 min **par compte** puis 429 `TOO_MANY_REQUESTS` ; email obligatoire, normalisé (`trim`, minuscules) |

- `packages/lib/src/roles.ts` : `SUPERVISOR` retiré de `canCheckIfRefExist`.
- `api/src/middlewares/rateLimit.ts` : nouveau `userRateLimiter`. Il repose sur le même store
  (Redis, mémoire à défaut) que les limiteurs d'authentification, mais compte par `req.user._id`
  et non par IP. Il se monte après l'authentification.
- `admin/src/scenes/structure/create.jsx` : la vérification préalable n'est faite que pour les
  rôles autorisés. Pour un superviseur, un doublon remonte par le 409 `USER_ALREADY_REGISTERED`
  de `signup_invite`. Ce 409 aboutissait jusqu'ici au toast générique « Erreur! ». Il affiche
  maintenant un avertissement explicite et redirige vers la fiche de la structure créée.

**Écart assumé avec le ticket :** le 409 de `POST /referent/signup_invite/:template` révèle lui
aussi qu'un email est déjà inscrit, à tout rôle qui peut inviter, superviseur compris. Ce n'est
pas un oracle silencieux : quand l'email est inconnu, l'appel crée le compte et envoie une
invitation. L'appel se voit donc et laisse une trace. Le conserver permet au superviseur d'inviter
une structure. Un superviseur peut désormais créer une structure sans responsable s'il saisit
l'email d'un compte existant, cas rare et visible, que la fiche permet de corriger.

## Démonstration

`api/src/__tests__/referent-exist-oracle.test.ts` (9 cas, 3 en échec sans le correctif) :

- superviseur, responsable, chef de centre, visiteur → 403, corps identique pour un email connu et
  un email inconnu ;
- admin, référent régional, référent départemental → `true` pour un email connu (même en
  majuscules), `false` pour un inconnu ;
- corps sans email → 400 ;
- 30 appels d'un même référent départemental → 20 × 200 puis 10 × 429.

Suites `referent.test.ts`, `referent-auth.test.ts`, `referent-security.test.ts` : vertes (155 cas).

## Actions de déploiement

Aucune. Le limiteur utilise le Redis déjà configuré sur l'api v1. Le front admin et l'API peuvent
être déployés séparément : un admin non redéployé reçoit un 403 sur `/exist` pour un superviseur,
et le formulaire tombe alors dans son `catch` générique.
