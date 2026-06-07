# Bug pré-existant : `anonymizeNonDeclaredFields` est un no-op

**Statut :** confirmé empiriquement. **Introduit par :** commit `8a6280f63` (jan. 2025), *pas* par la branche `feat/anonymization-old-cohorts`. **Bloque la PR #5270 :** non (voir « Impact »).

## Le bug

`api/src/anonymization/utils/anonymise-model-fields.js` — le moteur censé neutraliser
tous les champs **hors whitelist** ne neutralise **rien** :

```js
function anonymizeNonDeclaredFields(item, whitelist, seen = new Set()) {
  if (seen.has(item)) return item;
  seen.add(item);                              // (1) item ajouté à `seen`
  const allPaths = getAllPaths(item, "", seen); // (2) même `seen` passé en argument
  ...
}

function getAllPaths(obj, parentPath = "", seen = new Set()) {
  let paths = [];
  if (seen.has(obj)) return paths;             // (3) obj === item, déjà dans `seen` → []
  seen.add(obj);
  ...
}
```

En (1) `item` est ajouté à `seen`, puis en (2) on appelle `getAllPaths(item, …, seen)`.
La première ligne de `getAllPaths` (3) court-circuite car `item` est déjà dans `seen` et
renvoie un tableau **vide**. La boucle de neutralisation ne s'exécute jamais : l'objet
est renvoyé **inchangé**.

### Reproduction

```js
const { anonymizeNonDeclaredFields } = require("./src/anonymization/utils/anonymise-model-fields");
const out = anonymizeNonDeclaredFields(
  { keep: "stays", secret: "PII", nested: { drop: "PII" } },
  ["keep"],
);
// → { keep: "stays", secret: "PII", nested: { drop: "PII" } }  (rien n'est neutralisé)
```

`seen` joue un double rôle — protection anti-cycle **et** (par accident) court-circuit de
la racine. Le `Set` de déduplication de `anonymizeNonDeclaredFields` ne doit pas être celui
qui sert à `getAllPaths` : **donner à `getAllPaths` son propre ensemble « visité » frais**
(indépendant de la déduplication) corrige le bug sans casser la protection anti-cycle.

## Conséquence

La whitelist (« garder ceci, neutraliser tout le reste ») est **morte**. La seule
anonymisation réellement effectuée vient des affectations **explicites** dans chaque
modèle (`item.x = undefined`, `starify(...)`, vidage des fichiers). Tout champ PII **non
whitelisté et non traité explicitement** **survit** à l'anonymisation.

14 modules appellent ce moteur (`young`, `application`, `contract`, `referent`,
`structure`, `mission`, `cohesionCenter`, `sessionPhase1`, `meetingPoint`,
`missionEquivalence`, `waitingList`, `departmentService`, `PlanDeTransport/ligneBus`,
`PlanDeTransport/modificationBus`).

## Impact sur la PR #5270 — nul

- **Jeune** : le script `anonymizeOldCohorts.effect.ts` réécrit le jeune au plancher via
  `replaceOne` — le moteur n'est pas sur le chemin. Garantie intacte.
- **Application & Contract** : **tous** les champs de schéma sont dans la whitelist
  (vérifié : `schema_fields − whitelist = ∅` pour les deux). Il n'y a donc aucun champ
  « hors whitelist » à neutraliser ; la PII est traitée par les affectations explicites,
  qui fonctionnent. Le no-op est **inerte** ici.

Le moteur cassé n'introduit donc **aucune fuite** sur le périmètre de cette PR.

## Suivi recommandé (hors PR)

1. **Corriger le moteur** (ensemble « visité » dédié pour `getAllPaths`) — PR séparée,
   car le comportement de 14 anonymiseurs change : des champs aujourd'hui conservés par
   inadvertance seraient neutralisés. À valider modèle par modèle.
2. **Auditer les 13 autres modèles** : pour chacun, calculer `schema_fields − whitelist`
   et vérifier que les champs restants sont soit non-PII, soit traités explicitement.
   (Fait pour `application`/`contract` : ∅.)
3. À la correction du moteur, activer le test `it.todo` dans
   `api/src/__tests__/anonymization.test.ts` (contrat de neutralisation par type) et
   remplacer le test-sentinelle « NE NEUTRALISE RIEN ».
