# GOO-19 — socle snu-lib : filtre d'URL et configuration HTML partagés

Chantier transverse n° 1 de l'audit des fronts du 2026-09-23 (ticket Linear GOO-19). Réalisé le
2026-09-24 sur `origin/main` @ `02999e0e0`.

## 1. Constat

GOO-6, GOO-7 et GOO-14 ont chacun écrit leur filtre : six copies du filtre d'URL (snupport-app ×2,
snupport-api ×2, knowledge-base-public, plus le `urlWithScheme` de app et admin) et trois
configurations sanitize-html. Aucune n'était fausse au 24/09, mais rien n'empêchait qu'elles
divergent, et snu-lib n'offrait aucun filtre d'URL aux fronts.

## 2. Ce qui change

| Où | Avant | Après |
| --- | --- | --- |
| snu-lib | `htmlCleaner` seul, schémas écrits en dur | `utils/safeUrl.ts` : `sanitizeLinkUrl` (option `allowSitePath`), `sanitizeImageUrl`, `sanitizeVideoUrl`, `sanitizeHttpsUrl`, `isSafe*Url` ; `HTML_CLEANER_OPTIONS` et `HTML_LINK_SCHEMES` exportés, schémas dérivés du filtre d'URL (+ `tel`) |
| snu-lib | `safeUrl.vectors.json` | vecteurs de test partagés (acceptés / refusés) par filtre, rejoués par chaque copie |
| app | `program.url` et `urlPhaseEngagement` rendus bruts dans un `href` (accueil, carte d'engagement, fiche programme) | `sanitizeLinkUrl` au rendu |
| app, admin | `urlWithScheme` : préfixe `http://` seulement | préfixe puis `sanitizeLinkUrl` |
| api | champs de mission rendus en HTML (`description`, `actions`, `contraintes`, `justifications`, `frequence`) stockés tels quels, y compris le HTML de JeVeuxAider | `sanitizeStoredHtml` à l'écriture dans `validateMission` et dans `formatMission` (cron JVA) |
| snu-lib | `sanitizeStoredHtml` assainissait dès qu'un `<` apparaissait (« âge < 16 ans » devenait `&lt;` dans le champ de saisie) | n'assainit que si un `<` peut ouvrir une balise (suivi d'une lettre, `/`, `!` ou `?`) |
| snupport-app | deux copies du filtre (`utils/safeUrl.js`, `scenes/knowledge-base/utils/safeUrl.js`) ; `htmlCleaner` sans `ul`, `rel` imposé seulement sur `target=_blank` | une seule copie, conforme à snu-lib ; la seconde n'est plus qu'un réexport avec `allowSitePath` ; `htmlCleaner` aligné sur la base snu-lib (`ul`, `rel` sur tout lien, schémas dérivés du filtre) |
| snupport-api | filtre recopié dans `knowledgeBaseContent.js` et `userContent.js` | un seul module `utils/safeUrl.js`, utilisé par les deux |
| knowledge-base-public | copie propre | copie alignée ligne à ligne sur la référence |

## 3. Choix

- **snupport-app, snupport-api et knowledge-base-public ne dépendent pas de snu-lib**, et cette PR ne
  crée pas cette dépendance : le point d'entrée de snu-lib charge mongoose, react-query et date-fns
  (dépendances pairs), ce qui imposerait de les installer et de les empaqueter dans les deux
  applications du support ; knowledge-base-public est hors des workspaces npm.
  Chacun garde donc **une** copie du filtre, marquée comme telle, et ses tests rejouent les vecteurs
  de snu-lib (`packages/lib/src/utils/safeUrl.vectors.json`) : une divergence casse le test. La KB n'a
  pas de suite de tests ; sa copie a été vérifiée contre les vecteurs à la main.
- Filtre d'URL = liste blanche de schémas vérifiée sur l'URL **analysée** (`new URL`), jamais un test
  de préfixe : les variantes de casse, espaces, tabulations et caractères de contrôle sont couvertes
  par les vecteurs.
- `tel` reste accepté dans le HTML assaini (numéros des descriptions) mais pas dans le filtre d'URL,
  conformément au ticket (http, https, mailto).
- snupport-app garde ses ajouts propres aux e-mails : `br`, `div`, `blockquote` et les images `data:`
  matricielles en base64 (images collées, jamais dans un href).

## 4. Hors périmètre

- Missions déjà en base : pas de migration. Leurs champs HTML sont déjà filtrés au rendu
  (`htmlCleaner` dans app et admin) ; l'assainissement à l'écriture s'applique à la prochaine
  modification ou synchronisation JVA.
- Messages, notes, raccourcis et articles de la KB : déjà assainis à l'écriture par GOO-6, GOO-7 et
  le lot Q ; cette PR n'en change que la source du filtre.

## 5. Tests

- `packages/lib/src/utils/safeUrl.spec.ts` : vecteurs partagés, valeur normalisée, chemins internes.
- `packages/lib/src/common.spec.ts` : schémas dérivés, `tel`/`mailto` gardés, `data:`/`vbscript:`
  retirés, `sanitizeStoredHtml` sur « < » littéral.
- `snupport-app/src/utils/__tests__/safeUrl.test.js`, `html.test.js` : vecteurs partagés, liens
  d'article, alignement de `htmlCleaner`.
- `snupport-api/src/__tests__/safeUrl.test.js` : vecteurs partagés.
- `api/src/__tests__/mission-html.test.ts` : champs de mission assainis, texte brut intact.
