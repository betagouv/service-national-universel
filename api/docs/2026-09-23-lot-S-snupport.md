# Lot S — pont support (`api/src/controllers/SNUpport.ts`) : M38, M36, M37, M39, L22

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Branche `fix/lot-s-snupport`, base `origin/main` (`044eb9382`)

Les cinq constats ont été relus sur le code courant avant correction : tous confirmés, aucun
n'avait été touché par #5294, #5295, #5304 ou #5308.

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M38 | `POST /SNUpport/upload` | anonyme, nombre de fichiers illimité, extension de la clé S3 prise du nom client | `authMiddleware(["referent", "young"])` placé **avant** `fileUpload` (aucun fichier temporaire écrit pour un anonyme) ; 10 fichiers max par requête ; quota de 20 fichiers par heure et par utilisateur (Redis, fenêtre fixe) → 429 ; extension dérivée du type détecté par magic number ; fichiers temporaires nettoyés sur toutes les sorties |
| M36 | `POST /SNUpport/ticket`, `POST /SNUpport/ticket/:id/message` | `files[].{name,url,path}` du client relayés tels quels | chaque dépôt est enregistré en Redis sous `snupportAttachment:<userId>:<path>` (TTL 24 h) ; les routes de message ne relaient que ces enregistrements, retrouvés par `path` pour l'utilisateur courant et consommés (usage unique). `name` et `url` du client sont ignorés. Chemin inconnu, d'un autre utilisateur, expiré ou déjà utilisé → 400, rien n'est envoyé au support |
| M36 | `POST /SNUpport/ticket/form` | idem, en anonyme | `files` doit être absent ou vide (un anonyme ne peut plus rien déposer) |
| M36 | `snupport-api POST /v0/message` | `files[].path` libre | seconde barrière : `SCHEMA_ATTACHMENT_PATH` = `^message/[0-9a-zA-Z.-]+$` (repris de la branche `fix/m36-pieces-jointes-ticket`) |
| M37 | `POST /SNUpport/ticket/form` | renvoyait la réponse brute du support, dont `ticket.contactGroup` (« young exterior » / « admin exterior » / « unknown ») | réponse uniforme `{ ok: true }` ; en échec `{ ok: false, code: SERVER_ERROR }`, le détail part sur Slack |
| M39 | `GET /SNUpport/s3file/:id` | tout authentifié lit `message/<id>` | `id` sans `/` ni `\` ; le fichier n'est servi que si un message d'un des tickets de l'utilisateur le référence (`files` ou `attachments`), via la liste `/v0/ticket?email=` déjà utilisée par `isTicketOwner` (#5294) puis `/v0/ticket/withMessages` → sinon 403, sans lecture S3. L'objet `error` n'est plus renvoyé en 500 |
| L22 | `POST /SNUpport/knowledgeBase/feedback` | corps relayé sans validation | schéma Joi fermé (`isPositive`, `knowledgeBaseArticle` en 24 hex, `comment` ≤ 5000) ; champ inconnu → 400 ; `contactEmail` ne vient que de la session ; commentaire vide omis |

`isTicketOwner` et le contrôle M39 partagent désormais `listOwnTickets`.

## Impact front

- **Formulaires publics** (`app/.../PublicContactForm.jsx`, `admin/.../public-support-center/form.jsx`) : le
  champ de pièce jointe est retiré. Sans cela, l'upload renverrait 401 et `API.uploadFiles` de l'app
  redirigerait le visiteur vers `/auth`. **Conséquence produit : un visiteur non connecté ne peut plus
  joindre de fichier au formulaire de contact.**
- Parcours connectés (`ContactForm`, `echanges/View`, `support-center/ticket/{create,view}`) : inchangés. Ils
  renvoient `filesResponse.data` tel quel ; seul `path` est désormais lu.
- Base de connaissance publique (`FeedBack.jsx`) : inchangée, elle n'envoie que les trois champs admis.

## Démonstration

17 tests ajoutés à `api/src/__tests__/snupport.test.ts`, lancés **avant** le correctif et en échec pour
la raison attendue :

- M38 : `passport.authenticate` jamais sollicité (`Received: undefined`) ; 11 fichiers et 21ᵉ fichier
  acceptés (200) ; `page.html` stocké en `message/<uuid>.html`.
- M36 : pièce jointe forgée, pièce d'un autre utilisateur et pièce réutilisée acceptées (200) ; le
  corps relayé portait `url: "https://evil.example/phishing"`.
- M37 : réponse contenant `data.data.ticket.contactGroup: "young exterior"` pour un email de jeune.
- M39 : pièce jointe du ticket d'un tiers servie (200).
- L22 : champs inconnus, article manquant et `contactEmail` fourni par le client acceptés (200).

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `api` — `snupport.test.ts` + `snupport-client.test.ts` | 34/34 |
| `snupport-api` — suite complète | 23 suites, 198/198 |
| `api` — `tsc -p tsconfig.check.json --noEmit` | 2 erreurs `TS6307` préexistantes, sans rapport ; 0 sur les fichiers modifiés |
| `snupport-api` — `tsc -p tsconfig.build.json --noEmit` | 0 erreur |
| `eslint` (api, app, admin) sur les fichiers modifiés | 0 erreur |

## Points d'attention

- L'upload dépend désormais de Redis (quota et enregistrement) : Redis indisponible → 500 sur
  l'upload (échec fermé), les messages sans pièce jointe ne sont pas affectés.
- `GET /s3file/:id` fait 1 + N appels au support (N = nombre de tickets de l'utilisateur).
- La branche `fix/m36-pieces-jointes-ticket` (jeton HMAC, non poussée) est remplacée par ce lot.
