# GOO-14 — injections HTML et liens non contrôlés dans app et admin (FH1, FM8, FM9, FM12, FL3, FL4, FL5, FL7)

Audit des fronts du 2026-09-23. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `032f6173c`
(ticket Linear GOO-14). Tous les constats étaient encore ouverts, code relu.

## 1. Constats et correctifs

| Id | Où | Défaut | Correctif |
| --- | --- | --- | --- |
| FH1 | app, fiche mission (`viewDesktop.jsx`, `viewMobile.jsx`, `InfoStructure`) | description de structure (saisie par un responsable ou reprise de JeVeuxAider) rendue par `dangerouslySetInnerHTML` sans filtre | rendu via `htmlCleaner` ; à l'écriture, `sanitizeStoredHtml` dans `validateStructure` et dans `formatStructure` (cron JVA) ; migration d'assainissement de l'existant |
| FM8 | admin, `components/Panel.jsx` (`Details`) | valeurs du volontaire rendues en HTML | rendu en texte |
| FM9 | admin, `EmailPanel.jsx` ; API `serializeEmailContent` | corps Brevo dans une iframe `srcDoc` sans `sandbox`, à l'origine de l'admin ; motif de désistement libre injecté tel quel dans le template WITHDRAWN | iframe `sandbox` sans `allow-scripts` ni `allow-same-origin` ; corps assaini côté API (liste blanche sanitize-html, liens `http(s)`/`mailto`/`tel` en `target=_blank rel="noopener noreferrer"`) ; `sanitizeEmailText` sur `motifPersonnalise` |
| FM12, FL7 | `htmlCleaner` (snu-lib), utilisé par la fiche mission, les messages de ticket, etc. | `target` et `rel` du lien conservés tels que saisis (reverse tabnabbing), liens relatifs au protocole acceptés | `rel="noopener noreferrer"` imposé, schémas `http`, `https`, `mailto`, `tel` seulement, pas de `//hôte` |
| FM12 | admin, fiche mission (`Field.tsx`, `details.tsx`) | `contraintes` et `frequence` rendues en HTML | nouvelle option `plainText` de `Field` : rendu en texte |
| FL3 | admin, plan de transport (`From.jsx`, `To.jsx`, `edit-transport/components/Select.jsx`, `deplacement/components/Select.jsx`, `SelectTable.jsx`, `plan-transport/components/Select.jsx`) | `option.label` (noms de PDR, de lignes) rendu par `dangerouslySetInnerHTML` | rendu en texte (11 occurrences) |
| FL4 | admin, `email-preview` ; API `GET /email-preview/template/:id` | HTML du template injecté dans la page admin ; `id` libre inséré dans le chemin Brevo | iframe `sandbox` ; `id` validé en entier positif côté API et côté front, encodé |
| FL5 | admin `missions/create.jsx`, `validate/index.jsx` ; app `contract/index.jsx` | paramètres d'URL concaténés dans des chemins d'API | format vérifié (ObjectId 24 hex, jeton `[A-Za-z0-9_-]`) avant tout appel, puis `encodeURIComponent` |

## 2. Choix

- `sanitizeStoredHtml` ne touche pas un texte sans `<` : la description se saisit dans un textarea,
  et passer un texte brut par sanitize-html transformerait ses `&` en `&amp;` dans le champ d'édition.
  Un texte sans balise ne peut pas créer d'élément.
- Le corps d'e-mail garde la mise en page (tableaux, styles en ligne, images) : la liste blanche retire
  scripts, gestionnaires d'événements, cadres et formulaires. Les feuilles `<style>` sont retirées
  (sanitize-html les classe comme vulnérables) : les mails Brevo sont stylés en ligne.
- L'iframe garde `allow-popups allow-popups-to-escape-sandbox` pour que les liens restent cliquables
  dans un nouvel onglet ; sans `allow-scripts` ni `allow-same-origin`, le contenu n'exécute rien et
  n'accède ni au `localStorage` ni aux cookies de l'admin.

## 3. Hors périmètre

- CSP sans `unsafe-inline` et `Cross-Origin-Opener-Policy` : GOO-17.
- Filtre d'URL partagé par tous les fronts : GOO-19 (le durcissement de `htmlCleaner` en est une partie).

## 4. À faire en production

- Lancer la migration `20260923200000-goo-14-assainissement-description-structures` (elle compte les
  descriptions balisées examinées et assainies). Monstache répercute les modifications dans l'index.

## 5. Tests

- `packages/lib/src/common.spec.ts` : `htmlCleaner` (scripts, schémas, `rel` imposé) et `sanitizeStoredHtml`.
- `api/src/__tests__/email-content.test.ts` : corps assaini, liens, secrets toujours masqués, mail d'authentification.
- `api/src/__tests__/email-preview.test.ts` : identifiant non numérique → 400 sans appel Brevo.
- `api/src/__tests__/structure.test.ts` : description balisée assainie à l'écriture, texte brut intact.
