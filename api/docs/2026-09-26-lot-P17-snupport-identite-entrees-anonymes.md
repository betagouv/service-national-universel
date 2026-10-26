# Lot P17 — snupport-api : identité des entrées anonymes et périmètre des agents référents

Audit de sécurité de la production du 25/09/2026, constats PH25, PM45, PM46, PM48 et PM52
(ticket Linear GOO-68). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

Le brouillon initial du lot P17 (audit) mentionnait aussi PM32 et PL25 (lien « page précédente »,
images distantes du support) : ces deux constats sont traités séparément par le lot P33
(GOO-84), non touchés ici — le lot P17 ne touche que `snupport-api`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PH25 | élevée | `POST /message`, `POST /message/sendEmailFile/:id` (snupport-api) | `messageHistory` (un id de message précis cité en plus du dernier, dans l'email de réponse) doit désormais appartenir au ticket courant (`MessageModel.findOne({_id, ticketId})`), sinon 403 ; défense en profondeur dans `getLastAndSpecificIdMessageFromTicket` (scope par `ticketId`) |
| PM45 | moyenne | `POST /ticket` (snupport-api) | un référent départemental/régional ne peut plus créer de contact inconnu sur un simple `contactEmail`, ni créer de ticket sur un contact `young` hors de son département/sa région (`canAccessContact`) ; la réponse ne renvoie plus qu'une projection minimale (`_id`, `number`) pour ces rôles |
| PM46 | moyenne | `POST /v0/message` (formulaire public, source FORM) | l'email saisi n'authentifie personne : si un contact existe déjà pour cet email, le ticket créé est marqué `identityVerified: false` au lieu d'être rattaché silencieusement à la fiche réelle |
| PM48 | moyenne | Entrée IMAP (`imap.js`, `addMessage`) | même traitement que PM46 côté canal mail (`From` jamais authentifié, ni SPF/DKIM) ; `ticket.copyRecipient` n'est plus initialisé depuis les To/Cc du premier mail entrant |
| PM52 | moyenne | `sendNotif` (accusé de réception MESSAGE_RECEIVED) appelé depuis `v0/message.js` (formulaire anonyme) et `imap.js` | le texte choisi par l'expéditeur n'est plus recopié dans l'accusé de réception officiel pour ces deux canaux jamais authentifiés |

En complément, un nouveau champ `identityVerified` (booléen, défaut `true`) sur `TicketModel`
et un filtre `identityVerified: { $ne: false }` sur `GET /v0/ticket` (par email) ferment le vecteur
commun à PM46/PM48 : un ticket créé sur l'email d'un contact déjà connu, via un canal non
authentifié, n'apparaît plus dans son propre espace « Mes échanges » tant qu'il n'a pas lui-même
répondu au fil.

## 2. Choix

- **Helper partagé `snupport-api/src/utils/contactVerification.js`** (`resolveUnverifiedContact`),
  utilisé à l'identique par `v0/message.js` (isAnonymousForm) et `imap.js` (addMessage) : réutilise
  le contact existant (email unique en base, impossible de créer une fiche « fantôme » distincte)
  et renvoie `identityVerified: false` dès qu'une fiche préexistante est trouvée, `true` pour un
  email jamais vu (rien à usurper dans ce cas).
- **`identityVerified` porte sur le ticket, pas sur le contact** : la contrainte d'unicité de
  l'email sur `ContactModel` empêche de matérialiser une fiche « non vérifiée » distincte de la
  fiche réelle. Marquer le ticket suffit à fermer le vecteur décrit par l'audit (apparition dans
  l'espace de la victime) sans toucher au modèle de contact ni à sa synchronisation.
- **PM45 — piège de test confirmé dans ce dépôt** : `canAccessContact` (`utils/contactScope.js`)
  renvoie `true` dès que `contact.role !== "young"` ; un contact de test sans `role: "young"`
  explicite rend n'importe quel test de périmètre vert par construction. Les tests ajoutés fixent
  toujours `role`, `department` et `region` sur les contacts mockés.
- **PM45 — pas de contact inconnu pour un référent scoped** : si `ContactModel.findOne` ne trouve
  rien pour l'email fourni, un référent départemental/régional est refusé (403) avant toute
  création — un email jamais vu ne peut pas être vérifié en périmètre.
- **PM52 — condition sur `isAnonymousForm`, pas sur `source`** : dans `v0/message.js`, seule la
  branche formulaire public (`source === "FORM"`) omet `message` ; les autres sources (`PLATFORM`
  notamment), qui transmettent l'identité réelle d'une session authentifiée côté api v1, gardent
  le texte dans l'accusé de réception. Un test dédié couvre ce cas pour éviter une régression
  silencieuse si `isAnonymousForm` était un jour mal recalculé.
- **`sanitizeMessageHtml(undefined)` renvoie `""` en sécurité** (vérifié : la fonction ne traite
  que les valeurs de type `string`) — omettre `message` dans l'appel à `sendNotif` ne fait donc
  planter ni la sanitization ni le rendu du template Brevo.
- **Test M92 existant mis à jour** (`v0.message.contact.test.js`) : l'assertion qui vérifiait que
  l'accusé de réception recopiait un texte assaini (`sendNotif.mock.calls[0][0].message`) attendait
  un contenu sanitizé ; PM52 rend ce contenu absent (`undefined`) pour le formulaire anonyme — le
  test est scindé en deux (sanitization du texte stocké, conservée ; absence du texte dans
  l'accusé, nouvelle assertion), sans perte de couverture.

## 3. Impact fonctionnel

- Un usager anonyme (formulaire public ou mail) qui écrit avec l'email d'un contact déjà connu
  (référent, admin, jeune) ne voit plus son ticket apparaître automatiquement dans l'espace de ce
  contact tant que celui-ci n'a pas lui-même répondu au fil — comportement inchangé pour tout
  email jamais vu, et pour toute réponse authentifiée (session, IMAP sur un fil déjà validé par
  `canSenderJoinTicket`, cf. H86).
- Un référent départemental/régional ne peut plus créer un ticket pour un email qu'il ne connaît
  pas encore côté support ; le message d'erreur est un simple 403 (pas de distinction UI dédiée).
- L'accusé de réception officiel du support (template Brevo MESSAGE_RECEIVED) ne cite plus le
  texte de l'expéditeur pour les canaux formulaire public et IMAP — son contenu reste générique
  (lien vers le ticket).

## 4. Tâches post-déploiement

- Déploiement : `snupport-api` seul.
- Aucune migration : `identityVerified` a un défaut Mongoose (`true`) appliqué à la lecture des
  documents existants qui ne portent pas encore le champ ; aucun script de backfill nécessaire.
- Après fusion, comme recommandé par l'audit pour ce lot : rechercher les tickets FORM et MAIL déjà
  existants rattachés à l'identité d'un référent, d'un admin ou d'un jeune existant, pour repérer
  une éventuelle usurpation passée avant ce correctif (script en lecture seule, hors périmètre de
  cette PR — cf. le script d'audit `GOO-40`/`goo-40-audit-patches-referents` pour le patron à
  suivre).
- P31 (GOO-83, antivirus des pièces jointes support) et P32 (GOO-86, journaux applicatifs) se
  rebasent sur ce lot (`imap.js`, `message.js`) : à fusionner après lui ou à rebaser dessus.
