# Lot P31 — snupport-api : analyse antivirus des pièces jointes (drapeau désactivé)

Audit de sécurité de la production du 25/09/2026, constat PM49 (ticket Linear GOO-83). Vérifié
ouvert puis corrigé le 2026-09-26 sur `origin/main`.

## 1. Correctif

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM49 | moyenne | Entrée IMAP (`imap.js`, `addMessage`) et `POST /message/sendEmailFile/:id` (snupport-api) | chaque pièce jointe déjà acceptée par `inspectAttachment` (magic numbers) passe désormais par un scan ClamAV avant d'être chiffrée et stockée (IMAP) ou envoyée à un contact (réponse d'agent) ; une pièce infectée est écartée silencieusement côté IMAP (comme un type non supporté), et rejetée en 403 `FILE_INFECTED` côté `sendEmailFile` |

Le scan est derrière le nouveau drapeau `ENABLE_ANTIVIRUS_SUPPORT` (défaut `false`) : le constat
ne se ferme réellement qu'à son activation, une fois l'infra ClamAV confirmée joignable depuis
snupport-api. Drapeau désactivé, le comportement est strictement inchangé (`scanBuffer` renvoie
`{ infected: false }` sans appeler ClamAV).

## 2. Choix

- **Nouveau module `snupport-api/src/utils/virusScanner.js`, calqué sur
  `api/src/utils/virusScanner.js`** : même dépendance (`clamscan`, déjà utilisée par l'API v1),
  même schéma de configuration (`clamdscan.socket`), mêmes fonctions `initVirusScanner`/scan.
  Seule différence : les pièces jointes support n'existent qu'en mémoire (attachment IMAP décodé
  par `mailparser`, buffer d'upload multipart) alors que l'API v1 scanne un fichier temporaire sur
  disque (`express-fileupload` avec `useTempFiles`) — `scanBuffer(buffer, name)` utilise donc
  `clamscan.scanStream` sur un `Readable.from(buffer)` plutôt que `clamscan.isInfected(tempFilePath)`.
- **Fail-closed si le drapeau est actif mais le scanner n'a pas pu s'initialiser** : si
  `ENABLE_ANTIVIRUS_SUPPORT=true` alors que `clamscan.init()` a échoué au démarrage (ClamAV
  injoignable), `scanBuffer` renvoie `{ infected: true }` (capturé en Sentry) plutôt que de
  laisser passer une pièce jointe non scannée. C'est le risque fonctionnel documenté par l'audit
  (« dépôts bloqués sans ClamAV ») — assumé une fois le drapeau activé, jamais atteint tant qu'il
  reste à `false`.
- **Scan après `inspectAttachment`, pas avant** : le filtre par magic numbers (H86, liste close de
  types) élimine déjà l'essentiel du bruit (executables, HTML/SVG, ASF forgé) sans dépendre d'un
  service externe ; ClamAV ne voit que les pièces jointes déjà d'un type légitime, ce qui limite le
  volume à scanner à ce que l'audit vise réellement (PDF/OOXML/ODF/images comme vecteurs d'exploits
  de lecteurs).
- **`sendEmailFile` scanné aussi, pas seulement l'entrée IMAP** : l'audit ne cite que l'IMAP
  (pièces jointes anonymes), mais une pièce jointe ajoutée par un agent à une réponse part telle
  quelle vers un contact externe — même défense en profondeur que l'API v1 (`SNUpport.ts`, dépôt de
  pièce de ticket) plutôt qu'un scan asymétrique selon le sens du flux.
- **`clamscan` ajouté comme dépendance directe de `snupport-api`** (déjà une dépendance de `api`,
  simple ajout d'entrée dans `package-lock.json`, aucun nouveau paquet à résoudre).

## 3. Impact fonctionnel

- Drapeau désactivé (valeur de production actuelle) : aucun changement observable, `scanBuffer`
  ne fait rien.
- Drapeau activé : une pièce jointe détectée infectée par ClamAV n'est plus stockée ni transmise.
  Côté IMAP, elle est simplement absente du ticket (comme un type non supporté aujourd'hui) ; côté
  réponse d'agent (`sendEmailFile`), l'agent reçoit un 403 explicite et doit retirer la pièce
  jointe suspecte avant de renvoyer sa réponse.

## 4. Tâches post-déploiement

- Déploiement : `snupport-api` seul, `ENABLE_ANTIVIRUS_SUPPORT=false` (défaut si la variable est
  absente).
- Activer le drapeau est une étape **distincte**, une fois l'infra ClamAV confirmée joignable
  depuis `snupport-api` (le même ClamAV que l'API v1, ou une instance dédiée — à trancher côté
  infra) : positionner `ENABLE_ANTIVIRUS_SUPPORT=true` puis vérifier en recette qu'un dépôt de
  pièce jointe saine passe toujours, avant de considérer PM49 réellement fermé.
- Décider d'un scan rétroactif des pièces déjà stockées avant ce correctif (hors périmètre de
  cette PR, recommandé par l'audit).
- Ce lot se rebase sur P17 (GOO-68, `imap.js` `addMessage`, `message.js` `sendEmailFile`) : livré
  après lui, sans conflit résiduel constaté à l'écriture de cette note.
