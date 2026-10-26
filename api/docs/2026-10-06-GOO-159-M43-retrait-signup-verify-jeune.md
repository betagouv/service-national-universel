# M43 — retrait de POST /young/signup_verify

Date : 2026-10-06 · Lot V14 (GOO-159), constat M43 · Base `origin/main` (`5f47d2cad`)

## Ce qui change

| Constat | Où | Avant | Après |
|---|---|---|---|
| M43 | `api` `POST /young/signup_verify` | renvoyait le dossier jeune complet (`serializeYoung`) à tout porteur anonyme d'un `invitationToken` valide, sans contrôle d'identité ni session | route retirée (`api/src/controllers/young/index.ts`) : aucun appelant front (grep exhaustif sur `api/`, `app/`, `admin/`, `apiv2/`, `packages/`, `snupport-api/`, `snupport-app/`). Seule route sœur appelée, `POST /referent/signup_verify` (`admin/src/scenes/auth/signupInvite.jsx:31`), est distincte et non modifiée |

Les notes de lot précédentes (`2026-09-22-lot-C-anti-abus.md:98`, `2026-09-26-lot-P08-anti-abus-authentification.md:14,58`) décrivaient encore cette route comme montée et limitée par `youngSigninLimiter` : c'est désormais obsolète pour `/young/signup_verify` (`/young/signup_invite` reste montée et limitée, inchangée).

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `api` — `young`, `invitation-impersonation-security`, `auth-anti-abus` (ts-jest) | 3 suites, 90/92 passés (2 skipped hors périmètre), 0 échec |
| Mutation (rule 13) : handler minimal remonté sur `/young/signup_verify` → test négatif rouge, confirmé, puis mutation annulée | rouge confirmé → annulée |

## Restant sur GOO-159 (lot V14)

PH13, PM13, PM17, PM23, H5, H22, H87, M26, FM1 (FM1 mergé séparément, PR #5485).
