# Lot P30 — snupport-api : relève IMAP résiliente aux emails forgés

Audit de sécurité de la production du 25/09/2026, constats PM50 et PM51
(ticket Linear GOO-78). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM50 | moyenne | Cron IMAP de snupport-api (`*/30 * * * *`), boîtes `contact@` et `inscription@mail-support.snu.gouv.fr` | `readMails` résout ou rejette désormais systématiquement sa promesse (erreur de connexion IMAP, `openBox`, `search`, flux de fetch) au lieu de rester bloquée indéfiniment ou de résoudre silencieusement `[]` sur une recherche en échec ; chaque boîte IMAP est traitée dans son propre `try/catch` dans `Module.fetch`, pour qu'un échec sur l'une n'empêche plus ni la relève de l'autre ni la persistance des `lastFetch` déjà avancés ; un corps de message plafonné à 25 Mo évite l'accumulation illimitée en mémoire |
| PM51 | moyenne | Entrée IMAP (`readMails` → `simpleParser`) | `mailparser` monté à `^3.9.3` (override `nodemailer >= 9.1.0` et `linkify-it >= 5.0.2` sous `mailparser` en défense en profondeur) ; chaque email est désormais analysé indépendamment via `Promise.allSettled` (au lieu d'un seul `Promise.all` bloquant tout le lot dès qu'un message forgé fait rejeter `simpleParser`) ; `skipTextToHtml: true` passé à `simpleParser` (le champ `textAsHtml` n'est jamais lu par `extractMailData`, seule la linkification — vecteur des CVE linkify-it — en profitait) |

## 2. Choix

- **Pas de réécriture vers une relève par UID (`UIDNEXT`)** : l'audit la suggère en remédiation de
  fond pour PM50, mais la taille du lot (≈150 lignes hors tests) ne couvre que la résilience aux
  erreurs et à l'analyse. La déduplication par `messageId` dans `addMessage` reste le filet de
  sécurité existant contre un même mail relevé deux fois (recherche `SINCE` à la granularité du
  jour) ; un passage à un curseur par UID reste un suivi possible, pas un prérequis de ce lot.
- **`Promise.allSettled` plutôt que `try/catch` par message dans une boucle séquentielle** : le
  parsing reste parallèle (comme avant), seule la sémantique d'échec change — un rejet individuel
  n'interrompt plus les autres promesses déjà lancées.
- **Plafond de 25 Mo par corps de message, pas de plafond par pièce jointe** : un email légitime
  avec plusieurs pièces jointes encodées en base64 (facteur ~1,33) tient large dedans ; le plafond
  porte sur le corps brut accumulé en mémoire pendant le fetch IMAP (avant tout passage par
  `inspectAttachment`), le point exact que PM50 identifie comme non borné. Un message qui dépasse
  est journalisé (`capture`) et écarté du lot sans jamais atteindre `simpleParser`.
- **Override npm scindé de la mise à jour de version** : `mailparser@3.9.28` (dernière version au
  moment du correctif) embarque déjà nativement `nodemailer@10.0.10` et `linkify-it@5.0.2` — les
  deux versions planchers demandées par l'audit sont donc satisfaites par la seule mise à jour de
  `mailparser`. L'override `nodemailer >= 9.1.0` / `linkify-it >= 5.0.2` sous `mailparser` (racine
  `package.json`) est conservé en garde-fou : il empêche qu'un futur correctif de patch de
  `mailparser` fasse redescendre silencieusement l'une des deux versions sous le plancher fixé par
  l'audit, sans contraindre la version de `nodemailer`/`linkify-it` utilisée ailleurs dans le
  monorepo (l'override ne s'applique qu'à l'arbre de dépendances de `mailparser`, entièrement
  imbriqué sous `snupport-api/node_modules/` : confirmé par `git diff package-lock.json`, aucune
  autre zone du lockfile touchée).
- **`package-lock.json` régénéré hors du worktree de travail** : `npm install --package-lock-only`
  à la racine d'un worktree remplace la ferme de liens de `node_modules` par de vrais paquets
  téléchargés (cf. `CLAUDE.md`) ; régénéré puis restauré via
  `rm -rf node_modules && ln -s <principal>/node_modules node_modules && bash devops/scripts/worktree-setup.sh`.
  La compatibilité de `mailparser@3.9.28` (forme de `references` en cas de valeur unique, valeurs
  de `html`/`textAsHtml` avec `skipTextToHtml`) a été vérifiée séparément dans le scratchpad, hors
  du worktree, avant d'accepter la mise à jour.

## 3. Impact fonctionnel

- Un email dont l'en-tête d'adresse ou le corps est pathologique (viser la complexité algorithmique
  de l'analyse d'adresse ou de la linkification, cf. PM51) n'interrompt plus l'ingestion des autres
  emails reçus au même cycle, et ne bloque plus indéfiniment le processus HTTP partagé avec l'API
  agents.
- Une coupure réseau ou IMAP pendant un cycle de relève ne fait plus stagner `lastFetch` à vie pour
  la boîte concernée sans jamais échouer proprement ; l'autre boîte (`contact@`/`inscription@`)
  continue d'être relevée normalement.
- Aucune perte de fonctionnalité côté agents/contacts : le format des mails traités
  (`extractMailData`) est inchangé, `textAsHtml` n'était déjà lu par aucun champ consommé.

## 4. Tâches post-déploiement

- Déploiement : `snupport-api` seul.
- Surveiller les premiers cycles du cron (toutes les 30 min) après déploiement : ni trou ni doublon
  d'ingestion sur les boîtes `contact@` et `inscription@mail-support.snu.gouv.fr` (risque signalé
  par l'audit, mécanisme de déduplication par `messageId` inchangé).
- Surveiller Sentry pour tout message `readMails: message IMAP ignoré, corps > ... octets` : un
  volume anormal indiquerait une tentative d'abus ou, à l'inverse, un email légitime dont la taille
  dépasserait le plafond retenu (25 Mo), auquel cas ajuster `MAX_MESSAGE_SIZE` dans
  `snupport-api/src/imap.js`.
- Suivi possible, hors périmètre de ce lot : relève par UID (`UIDNEXT`) plutôt que par date
  `SINCE`, comme le recommande l'audit pour fermer PM50 en profondeur.
