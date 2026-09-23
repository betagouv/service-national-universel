# Lot Q — support : flux contact, messages et IMAP (M87, M88, M91, M92, M93, M94, M97, M99, L50)

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-21 · Branche `fix/goo-21-lot-q-support`, base `origin/main` (`5d824f300`)

## État des constats sur `origin/main`

Chaque constat a été relu sur le code courant avant correction. Plusieurs avaient déjà été
partiellement corrigés par des lots précédents :

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| M91 | `files[].path` contraint au préfixe `message/` (lot S, #5354) ; pièces jointes refusées sur le formulaire anonyme | réécriture de la fiche d'un contact existant depuis le formulaire public ; message ajouté à un ticket sans vérifier qu'il appartient à son auteur ; `files[].url` libre ; HTML non échappé ; aucune limite de débit |
| M97 | rattachement IMAP par `[#N]` ou `References` réservé aux participants du fil ; types de pièces jointes par magic numbers (H86, #5302) | HTML du mail stocké et réémis sans assainissement |
| M88 | `dest` limité aux participants du fil (H86) | `copyRecipient` libre ; HTML libre ; pièces jointes de `sendEmailFile` sans contrôle |
| M92, M94, M93, M99, M87, L50 | — | ouverts |

Le PR #5361 (GOO-6, ouvert) valide déjà `role`, `department` et `region` sur `POST /SNUpport/ticket/form`
et ajoute la dépendance `sanitize-html` à snupport-api. Ce lot ne refait pas cette validation et
déclare la même dépendance à l'identique, pour que les deux branches fusionnent sans conflit.

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M91 | `snupport-api POST /v0/message` | `findOneAndUpdate` du contact par l'email reçu, quelle que soit la source | source `FORM` (formulaire anonyme) : le contact existant est lu, jamais modifié ; un `ticketId` est refusé (403). Toutes sources : un message n'est ajouté qu'au ticket dont `contactId` est l'auteur (403 sinon). Des pièces jointes, seuls `name` et `path` sont conservés. `message` limité à 20 000 caractères |
| M91 | `api POST /SNUpport/ticket/form` | aucune limite | 20 envois par heure et par IP (Redis) → 429 |
| M92 | `POST /v0/message` | texte concaténé tel quel dans le HTML stocké | texte échappé, puis mis en forme (retours à la ligne, liens) et assaini |
| M92, M97 | stockage des messages (agent, IMAP, création de ticket) | HTML brut | assaini par `utils/messageHtml.js` (`sanitize-html`, liste blanche de balises ; schémas `http`, `https`, `mailto`, `tel` ; aucun gestionnaire d'événement ; aucun style sauf le bandeau de citation) |
| M92 | emails sortants (`sendNotif`, « Répondre avec historique ») | HTML stocké réémis tel quel | assaini juste avant l'envoi, ce qui couvre aussi les messages stockés avant ce lot |
| M94 | `GET /v0/ticket`, `GET /v0/ticket/withMessages`, réponse de `POST /v0/message` | documents bruts : notes internes, brouillon agent, emails des agents et référents, journal de ventilation, destinataires en copie | liste blanche (`utils/contactTicketSerializer.js`) : ticket = `_id, number, status, subject, createdAt, updatedAt, messageCount, source, parcours, formSubjectStep1, formSubjectStep2, contactEmail` ; message = auteur, date, texte **assaini**, `files`/`attachments` réduits à `name` et `path` |
| M88 | `POST /message`, `POST /message/sendEmailFile/:id` | `copyRecipient` libre | chaque adresse en copie doit être un participant du fil ou un compte du support (agent, référent) → 403 sinon. Les copies choisies à la création d'un ticket (`POST /ticket`) sont désormais enregistrées sur le ticket et en font donc partie |
| M88 | `POST /message/sendEmailFile/:id` | corps JSON non validé | schéma Joi (`message`, `copyRecipient` en emails, `dest`, `messageHistory`) → 400 |
| L50 | `POST /message/sendEmailFile/:id` | type et extension repris du client, nombre de fichiers illimité | type détecté par magic numbers (même liste que l'IMAP) → 400 `UNSUPPORTED_TYPE` ; extension de la clé S3 tirée du type détecté ; 10 fichiers maximum ; plus de 10 Mo → requête interrompue |
| L50 | `index.ts` | `express-fileupload` monté globalement | monté sur les deux seules routes qui reçoivent des fichiers (`sendEmailFile`, `knowledge-base/picture`) |
| M87 | `DELETE /message/s3file/:id` | supprimait n'importe quel chemin du bucket | refuse (404) un chemin absent de `message.files` |
| M99 | `canAccessTicket` | périmètre géographique seul pour les référents | ajoute `formSubjectStep1 === "QUESTION"`, comme les listes (`scopeTicketQuery`) |
| M93 | `POST /v0/referent` | supprimait l'agent qui portait déjà le nouvel email d'un référent, ou le réécrivait en référent | un compte qui porte déjà l'email n'est repris que s'il appartient à ce référent (ou à un référent jamais rattaché) ; sinon rien n'est modifié, alerte Sentry et Slack. Rôle synchronisé limité à `REFERENT_DEPARTMENT` / `REFERENT_REGION` |
| M93 | `DELETE /v0/referent` | supprimait n'importe quel agent par email | ne supprime qu'un compte référent |

`Content-Disposition: attachment` sur les URL signées était déjà en place (`getSignedUrl(..., { download: true })`).

## Démonstration

35 tests ajoutés dans snupport-api (`v0.message.contact`, `v0.ticket.referent`,
`message.agent.lotq`, `messageHtml`, `imapTicketMatching`, `ticketScope`). Lancés sur les sources
d'`origin/main`, 23 échouent pour la raison attendue : fiche du contact réécrite, message anonyme
rattaché à un ticket existant, `<script>` stocké, notes internes renvoyées, agent support supprimé à
la synchro, objet S3 d'un autre ticket supprimé, copie vers une adresse arbitraire acceptée, SVG
accepté sous un nom `.pdf`, ticket hors QUESTION ouvert à un référent.

Côté api, `snupport.test.ts` vérifie qu'au 21ᵉ envoi du formulaire public la réponse est 429.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `snupport-api` — suite complète | 27 suites, 233/233 |
| `snupport-api` — `npm run check-types` | 0 erreur |
| `api` — `snupport.test.ts` | 32/32 |
| `eslint` snupport-api sur les fichiers modifiés | 0 erreur |

snupport-api n'a toujours pas de job de test en CI : ces tests ne tournent qu'en local.

## Changements de comportement à connaître

- **Agents** : une réponse ne peut plus mettre en copie une adresse extérieure au fil. Pour y
  ajouter quelqu'un, il faut l'avoir mis en copie à la création du ticket, ou qu'il soit un compte
  du support.
- **Agents** : `sendEmailFile` refuse désormais les pièces jointes `.doc`, `.xls`, `.csv`, `.txt`,
  `.svg`, `.html` et tout type non identifiable (même liste que l'entrée IMAP depuis H86).
- **Rendu** : les styles en ligne des mails entrants et de l'éditeur (couleurs, polices) sont retirés.
  La structure (paragraphes, listes, liens, tableaux, images http(s)) est conservée.
- **Formulaire public** : si l'email saisi est déjà connu, le ticket est créé sur la fiche existante,
  sans la mettre à jour ; nom et attributs saisis restent visibles sur le ticket lui-même.
- **Synchro des référents** : une collision d'email n'efface plus rien. Elle remonte sur Slack et
  doit être résolue à la main.

## Hors périmètre

- Un visiteur anonyme peut toujours ouvrir un ticket au nom de n'importe quelle adresse : c'est le
  principe d'un formulaire sans compte. L'accusé de réception part vers cette adresse, avec un
  contenu désormais échappé et un débit plafonné.
- Les messages déjà stockés ne sont pas réécrits en base : ils sont assainis à la lecture (`/v0`)
  et à l'envoi d'email. snupport-app les rend encore depuis `GET /message` ; le filtre au rendu de
  GOO-6 (#5361) couvre ce chemin.
