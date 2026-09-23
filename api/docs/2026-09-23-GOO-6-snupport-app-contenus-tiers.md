# GOO-6 — snupport-app : contenus écrits par les référents et le formulaire public (FH12, FH13, FH14, FH15, FM23, L48)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Branche `fix/goo-6-snupport-app-xss`, base `origin/main` (`5d8363d91`)

Les constats ont été relus sur le code courant avant correction. FH14 a été reproduit : avec l'ancien
`urlify`, la note `https://x/"onmouseover="alert(1)` produisait un attribut `onmouseover` réel sur le lien.

## Ce qui change

| Id | Où | Avant | Après |
|---|---|---|---|
| FH14 | notes internes (`ticket/view/left.jsx`) | `urlify` réécrivait le HTML déjà assaini, y compris l'intérieur des balises | `urlify` ne touche que les nœuds texte hors lien ; le résultat repasse par `htmlCleaner` (`noteToSafeHtml`) |
| FH13 | Paramètres › modules de texte et signatures | `shortcut.text` rendu par `dangerouslySetInnerHTML` | aperçu en texte brut (`htmlToText`, document inerte), rendu échappé par React |
| FH12 | éditeur Slate (`TextEditor`) | URL des nœuds lien, image et vidéo jamais filtrées ; `is-url` accepte `javascript://` | au rendu : lien en http/https/mailto, image en http/https, iframe limitée à `https://player.vimeo.com` ; `href` réel exposé et `window.open(…, "noopener,noreferrer")` ; à l'insertion : lien refusé si le schéma n'est pas autorisé ; à la sérialisation HTML : lien retiré |
| FH12 | `snupport-api` `PATCH` et `DELETE /shortcut/:id` | aucun contrôle de propriétaire : un référent modifiait la signature d'un agent | `canManageShortcut` : un compte ne touche qu'aux modules de son rôle et, pour un référent, de son territoire → 403 |
| FH12 | `snupport-api` `GET /shortcut` (signature automatique) | `findOne({ dest })` sans filtre de type ni de rôle | `isSignature: true` ; un agent ne reçoit qu'une signature d'agent, un référent celle d'un agent ou de son territoire |
| FH12 | `snupport-api` `POST` et `PATCH /shortcut` | `content: Joi.array()` libre, `text` brut | `content` : URL neutralisées par type de nœud (lien refusé → son texte, image ou vidéo refusée → retirée, `url`/`href`/`src` retirés des autres nœuds) ; `text` assaini |
| FH15 | fiche ticket, attributs de contact | lien émis dès que la valeur contient `https://` ou que le format est `link` | lien émis seulement pour une URL `https` analysée, pour tous les attributs ; idem pour « lien vers profil » |
| FH15 | `api` `POST /SNUpport/ticket` et `/ticket/form` | `fromPage`, `department`, `region`, `role` libres | `fromPage` ramené à un chemin relatif ou une URL https, sinon `null` (la demande n'est pas bloquée) ; `department`/`region` dans `departmentList`/`regionList` et `role` dans les rôles requalifiés, sinon 400 |
| FM23 | `htmlCleaner` (snupport-app) | attribut `style` et schéma `data:` admis partout | `style` retiré ; `data:` refusé dans les liens et admis seulement dans `<img src>` pour une image png, jpeg, gif, webp ou bmp en base64 (les images collées dans un e-mail arrivent ainsi : mailparser remplace les `cid:`) ; `rel="noopener noreferrer"` forcé sur `target="_blank"` ; URL protocole-relatives refusées |
| L48 | `snupport-api` `GET /agent/me`, `POST /agent/signin` | jeton `jwtzamoud` renvoyé dans le corps | plus de jeton dans le corps ; la session ne vit que dans le cookie httpOnly (le front n'utilisait déjà que le cookie : l'en-tête `JWT …` n'était pas reconnu par `getToken`) |
| — | `snupport-api` notes, `messageDraft`, notes des macros | stockés tels quels | assainis à l'écriture (`sanitizeUserHtml`, idempotent) |

Correctif annexe : `POST /shortcut` refusait `isSignature` (champ absent du schéma, 400) ; la création de
signature est de nouveau possible.

Le cache `redux-persist` (`TicketPreview`) est versionné : un cache antérieur est écarté au démarrage.
Le filtre au rendu suffit déjà à neutraliser une charge en cache.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `snupport-app` — `npm test` (nouveau, `node --test`) : `safeUrl`, `htmlCleaner`, `urlify` | 13/13 |
| `snupport-api` — suite complète | 26 suites, 231/231 (dont 33 nouveaux tests : `userContent`, `shortcutScope`, routes `/shortcut`) |
| `api` — `snupport.test.ts` | 34/34 ; les 3 nouveaux tests FH15 échouent sur l'ancien contrôleur |
| `snupport-app` — `vite build` | OK |
| `snupport-api` — `tsc --noEmit` | 0 erreur |

## Points d'attention

- `sanitize-html` devient une dépendance directe de `snupport-api` (même version que celle déjà hissée).
- Impact agents : les citations d'e-mails perdent leur mise en forme d'origine (`style`) ; les images
  collées dans les e-mails restent affichées.
- Un lien de contenu Slate sans schéma (`snu.gouv.fr`, chemin relatif) n'est plus rendu comme lien.
- Les modules de texte créés par les référents départementaux n'ont jamais eu de `userDepartment` : ils
  restent modifiables par tout référent départemental (jamais par un autre rôle).
- Restent hors de ce lot : la KB publique et `PUT /knowledge-base/:id/content` (GOO-7), le filtre partagé
  de snu-lib (GOO-19), le `htmlCleaner` de snu-lib utilisé par app et admin (GOO-19).
- Contrôle en base conseillé : modules de texte, signatures et brouillons contenant une URL non http(s).
