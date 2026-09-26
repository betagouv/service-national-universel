# Lot P31 — snupport-api : analyse antivirus des pièces jointes (drapeau désactivé)

Audit de sécurité de la production du 25/09/2026, constat PM49 (résiduel de H86), ticket Linear
GOO-83. Vérifié encore ouvert puis corrigé le 2026-09-26 sur `origin/main`.

## 1. Correctif

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM49 | moyenne | Entrée IMAP (`imap.js addMessage`) → pièces jointes téléchargées par les agents dans snupport-app, puis rejointes aux emails « avec historique » ; `POST /message/sendEmailFile/:id` (pièce jointe ajoutée par un agent à sa réponse) | nouveau client `clamscan` (`snupport-api/src/utils/virusScanner.js`, calqué sur `api/src/utils/virusScanner.js`), appelé après `inspectAttachment` (magic numbers) et avant tout chiffrement/upload, dans `addMessage` et dans `sendEmailFile` ; pièce jointe infectée écartée exactement comme un type non autorisé (silencieusement en IMAP, `400 INFECTED_FILE` côté agent) |

**Drapeau `ENABLE_ANTIVIRUS_SUPPORT` désactivé par défaut** : aucune infra ClamAV confirmée
joignable depuis snupport-api à ce jour. Tant qu'il reste à `false`, `scanBuffer` renvoie
systématiquement `{ infected: false }` sans instancier de client ni tenter de connexion — le
comportement de production est inchangé par cette PR. Le constat PM49 ne se ferme réellement qu'à
l'activation du drapeau, une fois l'infra confirmée (étape distincte, hors périmètre de cette PR).

## 2. Choix

- **Buffer plutôt que fichier temporaire** : contrairement à `api/src/utils/virusScanner.js`
  (`clamscan.isInfected(tempFilePath)`, utilisé sur des fichiers déjà écrits sur disque), les
  pièces jointes de snupport-api ne sont jamais matérialisées en fichier temporaire (`mail.attachments[].content`
  et `express-fileupload` sans `useTempFiles` sont déjà des `Buffer` en mémoire). `scanBuffer`
  utilise donc `clamscan.scanStream(Readable.from(buffer))` plutôt que `isInfected`, ce qui évite
  d'introduire une écriture disque uniquement pour le scan.
- **Après `inspectAttachment`, jamais avant** : le filtre de type (magic numbers, H86) rejette déjà
  la quasi-totalité des formats dangereux avant tout traitement coûteux ; le scan antivirus ne
  s'exécute que sur les pièces déjà acceptées par ce filtre, dans le même ordre que le
  `pourquoi ce regroupement` de l'audit (« calqué sur virusScanner.js api, appelé dans addMessage
  et sendEmailFile »).
- **`removeInfected: false`** (contrairement à `api/src/utils/virusScanner.js` qui a
  `removeInfected: true`) : `scanStream` ne reçoit qu'un flux en mémoire, jamais un chemin de
  fichier sur disque — il n'y a rien à supprimer côté ClamAV ; l'appelant (imap.js, message.js)
  décide lui-même de ne pas stocker/uploader la pièce infectée.
- **`initVirusScanner()` non attendu au démarrage** (`index.ts`) : cohérent avec le style déjà en
  place dans ce fichier (`require("./mongo")` ne bloque pas non plus `app.listen`) — pas
  d'orchestration `async main()` comme dans `api/src/main.js`. Sans incidence tant que le drapeau
  reste désactivé (`scanBuffer` court-circuite avant tout accès à `clamscan`) ; à revisiter si
  l'activation future montre une fenêtre de course au tout premier appel juste après un redémarrage.
- **Codes de rejet distincts par canal** : IMAP (expéditeur non authentifié) écarte silencieusement
  la pièce jointe et continue le traitement du message, comme pour un type non autorisé (H86) —
  aucune réponse HTTP à renvoyer à un expéditeur anonyme. `sendEmailFile` (agent authentifié)
  renvoie `400 { code: "INFECTED_FILE" }`, distinct de `"UNSUPPORTED_TYPE"`, pour que l'agent sache
  que le fichier a été bloqué par l'antivirus et non par le filtre de type.
- **`clamscan` déclaré en dépendance directe de `snupport-api`** (`package.json` +
  `package-lock.json`) plutôt que de compter sur le hoisting depuis la dépendance d'`api` : la
  résolution fonctionne déjà par hoisting (paquet déjà présent à la racine du monorepo pour `api`),
  mais la déclaration explicite documente la dépendance et évite une rupture si `api` retirait un
  jour clamscan de ses propres dépendances.

## 3. Tests

- `snupport-api/src/__tests__/virusScanner.test.js` : comportement du module isolé — drapeau
  désactivé (aucune instanciation de client, `scanBuffer` toujours `{ infected: false }`) et
  drapeau activé avec un client `clamscan` entièrement mocké (fichier sain, fichier infecté avec
  appel à `captureMessage`, scan du contenu réel via le flux passé à `scanStream`).
- `snupport-api/src/__tests__/imapAttachmentVirusScan.test.js` : `addMessage` (entrée IMAP) — pièce
  jointe saine uploadée après le scan, pièce jointe infectée jamais uploadée ni stockée, `scanBuffer`
  jamais appelé pour une pièce déjà écartée par `inspectAttachment`.
- `snupport-api/src/__tests__/message.agent.lotq.test.js` (étendu) : `POST /message/sendEmailFile/:id` —
  scan appelé sur le contenu détecté avant l'upload ; une pièce jointe infectée renvoie `400
  INFECTED_FILE` sans upload ni envoi d'email.
- Suite complète `snupport-api` (514 tests, `--maxWorkers=1`, Node 20) verte après ce lot ; aucune
  régression sur les tests IMAP existants (`imapTicketMatching.test.js`) ni sur les autres routes de
  `message.js` (`message.history.scope.test.js`, `message.dest.scope.test.js`,
  `roleMatrix.routes.test.js`). `npm run check-types` propre.

## 4. Impact fonctionnel

Aucun avec le drapeau désactivé (comportement de production inchangé). À l'activation :
dépôt d'une pièce jointe infectée refusé côté agent (`sendEmailFile`) et écarté silencieusement
côté entrée IMAP — un contact anonyme qui envoie un fichier infecté ne reçoit aucune erreur
spécifique (comme pour un type non autorisé), l'agent voit simplement le message sans cette pièce
jointe.

## 5. Tâches post-déploiement

- Déploiement : `snupport-api` avec `ENABLE_ANTIVIRUS_SUPPORT=false`. Aucune migration, aucune
  variable obligatoire supplémentaire.
- **Avant d'activer le drapeau** : confirmer avec l'infra que ClamAV (`clamd`, socket
  `/run/clamav/clamd.ctl`) est bien joignable depuis les instances Clever de snupport-api — sans
  cela, l'activation bloquerait tous les dépôts de pièces jointes (`scanStream` échouerait sur
  chaque appel). Étape distincte, non couverte par cette PR.
- Une fois le drapeau activé : décider d'un scan rétroactif des pièces déjà stockées (recommandé
  par l'audit, non fait ici — script en lecture puis suppression ciblée, hors périmètre de cette PR).
- P32 (GOO-86, journaux applicatifs) se rebase sur ce lot (`imap.js addMessage`) : à fusionner après
  celui-ci ou à rebaser dessus.
