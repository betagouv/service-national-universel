# GOO-17 (suite) — suppression de Plausible (FM3)

Suite de `2026-09-24-GOO-17-entetes-http-sourcemaps-tiers.md` (#5385), qui laissait ouvert le script
tiers Plausible. Corrigé le 2026-09-24 sur `origin/main` @ `1eceec3a9`.

## 1. Constat et correctif

| Id | Où | Défaut | Correctif |
| --- | --- | --- | --- |
| FM3 | `app/`, `admin/`, `snupport-app/` (`index.html`, `public/plausible-init.js`, `src/services/plausible.js` et ~90 appels `plausibleEvent`) ; `knowledge-base-public/src/pages/_document.js` | script de `plausible.io` exécuté sans SRI dans quatre origines porteuses de session, pour un outil qui n'est plus utilisé | Plausible est retiré des quatre fronts : balises `<script>`, initialisation, service `plausibleEvent` et tous ses appels. `https://plausible.io` est retiré de la CSP (`connect-src` de la KB ; `script-src` et `connect-src` des blocs nginx) |

## 2. Choix

- **Suppression plutôt que copie locale ou SRI.** Plausible n'est plus utilisé. Le meilleur
  correctif est donc de ne plus charger aucun code tiers.
- **Gestionnaires devenus vides.** Les `onClick` qui ne faisaient qu'envoyer un événement sont
  supprimés. Le gestionnaire est retiré quand il ne faisait rien d'autre : liens « Se désister »
  (phase 1), bouton « Poursuivre mon engagement », condition du sac à dos, `handleClick` de
  candidature. Au passage, `NavigationMenu.jsx` appelait `plausibleEvent` à chaque rendu (au lieu de
  lui passer une fonction) : cet appel disparaît aussi.
- **`DSFRContainer`** perd la prop `supportEvent`, qu'aucun appelant ne passait.
- **Case « Plausible tags/events »** retirée du modèle de PR.

## 3. Hors périmètre

- Le champ `event` du modèle `Cohort` (`packages/lib/src/mongoSchema/cohort.ts`) est documenté
  comme « Event plausible ». C'est une donnée en base, pas un appel à Plausible : on n'y touche pas.
- jstag.js (API Engagement) dans app reste le seul script tiers de `script-src`. Le retirer relève
  d'une décision produit.

## 4. Vérifications

- `git grep -i plausible` : il ne reste plus que le CHANGELOG, les notes de lot et le champ
  `Cohort.event`.
- Builds Vite de app, admin et snupport-app : `index.html` ne charge plus que le bundle, et aucun
  fichier JS ne mentionne Plausible (hormis la description du champ `Cohort.event`).
- `tsc -p tsconfig.ci.json --noEmit` : aucune erreur sur les trois applications.
- ESLint sur les fichiers modifiés : aucun avertissement `no-unused-vars` ni `prettier` de plus
  qu'avant la modification.
