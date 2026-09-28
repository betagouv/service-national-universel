# Lot P12 — Textes libres et liens dans les emails officiels

Audit de sécurité de la production du 25/09/2026, constats PM2, PM4, PM15, PM20, PM24 et PM37
(ticket Linear GOO-74). Vérifiés ouverts puis corrigés le 2026-09-27 sur `origin/main`, après la
fusion de P23 (GOO-65, #5449), qui avait déjà supprimé `PUT /young/change-cohort`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM2 | moyenne | `POST /application/:id/notify/:template` (REFUSE_APPLICATION) | le motif de refus et le nom de mission passent par `sanitizeEmailText` avant d'entrer dans les paramètres Brevo |
| PM2, PM4 | moyenne | `PUT /mission/:id` (statut CANCEL ou ARCHIVED) → `updateApplicationStatus` (MISSION_CANCEL, MISSION_ARCHIVED) | `missionName` et `message` (commentaire de statut du responsable) assainis |
| PM2, PM4 | moyenne | `PUT /young/:id/phase2/equivalence/:idEquivalence` → `notifyYoungChangementStatutEquivalence` ; nouvelle candidature → `notifyReferentNewApplication` | message d'équivalence et nom de mission assainis |
| PM15 | moyenne | `POST /SNUpport/ticket` (question d'un volontaire) → `notifyReferent` (MESSAGE_NOTIFICATION aux référents du département) | `message` et `from` assainis ; quota de 10 tickets par heure et par compte volontaire (`userRateLimiter`), les référents ne sont pas limités |
| PM20 | moyenne | `PUT /young/account/address` → DEPARTMENT_IN / DEPARTMENT_OUT | `department` et `region` validés contre `departmentList` et `regionList`, et la région doit être celle du département (`department2region`) ; l'ancien département, lu en base, est assaini ; quota de 10 changements par heure et par compte. La partie change-cohort du constat a disparu avec P23 |
| PM24 | moyenne | `POST /young/:id/email/:template` : liste de confiance des liens (`isTrustedEmailLink`) | l'hôte Cellar mutualisé (`CELLAR_HOST`, `CELLAR_ENDPOINT`) ne vaut plus comme origine de confiance ; seuls les chemins des buckets du SNU (`/cni-bucket-prod/`, `/cni-bucket-staging/`) sont admis, comparés après normalisation de l'URL |
| PM37 | moyenne | `POST /young/:id/email/:template` (gabarits `SENDINBLUE_TEMPLATES.parent`) | un volontaire ne peut plus déclencher les gabarits parents (403) ; quota de 10 envois par heure et par compte volontaire sur la route |

## 2. Choix

- **Assainir en sortie, point par point, plutôt qu'au centre de `sendTemplate`** : un filtre
  central toucherait la centaine de gabarits, dont certains reçoivent volontairement du HTML
  (le `params.message` de snupport-api). Le motif retenu reste celui de M67/M74 :
  `sanitizeEmailText` à chaque site qui recopie un texte saisi par un tiers.
- **Buckets écrits en dur** : ce sont les mêmes valeurs que `CDN_BASE_URL` côté app et admin. Le
  seul lien envoyé par un front sur cette route (fiche sanitaire, `MedicalFileModal`) reste admis.
  La comparaison porte sur le chemin déjà normalisé par `URL` : une remontée (`..`, y compris
  encodée) ou un nom de bucket voisin (`cni-bucket-prod-xxx`) est refusé.
- **Gabarits parents refusés au seul volontaire** : aucun front ne les appelle plus (parcours
  décommissionné, #5357). Un référent garde la possibilité technique d'en envoyer un, mais il ne
  contrôle pas l'adresse du représentant légal comme le volontaire le fait par
  `PUT /young/account/parents`.
- **Cohérence département et région** : l'app calcule la région à partir du département
  (`useAddress` → `department2region`), et les 109 départements de `departmentLookUp` figurent tous
  dans `departmentList`. Le contrôle ne refuse donc aucune adresse obtenue par le géocodage.

## 3. Impact fonctionnel

- Volontaire : au-delà de 10 envois par heure, `POST /young/:id/email/:template`,
  `POST /SNUpport/ticket` et `PUT /young/account/address` répondent 429. Un changement d'adresse
  dont le département ou la région n'est pas reconnu répond 400.
- Emails : le balisage des textes libres (motif de refus, commentaire d'annulation, message
  d'équivalence, question au support) est retiré. Un texte sans balise arrive inchangé.

## 4. Tâches post-déploiement

- Déploiement : api seul. Aucune migration, aucune variable d'environnement.
- Contrôles recommandés : rechercher du balisage ou des URL dans `mission.statusComment`, dans
  les noms de missions et dans les messages de tickets support déjà en base ; vérifier qu'aucun
  email légitime ne pointait vers un lien Cellar hors des deux buckets admis.
- Hors périmètre de ce lot : les crons `missionOutdated`, `applicationWaitingAcceptationOutdated`,
  `applicationPending` et `contratRelance` recopient eux aussi des noms de mission ou de
  structure lus en base, sans assainissement. Le rapport les classe en extension optionnelle.
