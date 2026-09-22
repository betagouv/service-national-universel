# CLAUDE.md

Consignes de travail sur ce dépôt. Elles priment sur les comportements par défaut.

## Toujours travailler dans un worktree

**Ne jamais modifier de fichier dans le checkout principal.** Plusieurs sessions
travaillent sur ce dépôt en même temps ; le checkout principal sert de base
partagée, pas d'espace de travail. Y écrire mélange les modifications de tout le
monde dans un même `git status`, et fait commiter sur la branche d'un autre.

Au début de toute tâche qui touche au code, créer un worktree :

```
EnterWorktree(name: "<sujet-court>")
```

Il est créé sous `.claude/worktrees/`, sur une branche neuve issue de
`origin/main` — c'est le réglage `worktree.baseRef: fresh` par défaut.

Puis **préparer l'isolation**, depuis la racine du worktree :

```bash
bash devops/scripts/worktree-setup.sh
```

Sans cette étape le worktree n'est pas isolé : `.claude/settings.local.json`
place `node_modules` dans `worktree.symlinkDirectories`, donc
`node_modules/snu-lib` (`-> ../packages/lib`) résout vers le `packages/lib` du
checkout principal. Un worktree compile alors contre le paquet partagé d'à côté,
modifications non commitées d'autres sessions comprises. Le script remplace le
lien racine par une ferme de liens (zéro duplication sur disque), pointe
`snu-lib`, `@snu/ds` et `@snu/log-redaction` sur le worktree, les construit, et
vérifie la résolution.

Pour vérifier à tout moment qu'on est bien isolé :

```bash
node -e "console.log(require.resolve('snu-lib'))"
```

Le chemin doit contenir le nom du worktree.

## Environnement

- **Node 20 obligatoire** (`engines: ^20.17`). Le `node` par défaut de la machine
  peut être plus récent ; `jsonwebtoken` meurt alors au chargement sur
  `Cannot read properties of undefined (reading 'prototype')` dans
  `buffer-equal-constant-time`, et **toute suite touchant au JWT devient
  inexécutable**. Préfixer :
  `export PATH="$(brew --prefix node@20)/bin:$PATH"`.
- MongoDB de test : conteneur `snu-test-mongo` sur `localhost:27017`.

## Tests

- **En série.** `npm test` porte `--maxWorkers=1` pour cette raison. Lancées en
  parallèle, les suites d'auth se perturbent mutuellement et produisent des
  échecs qui n'existent pas. Ne jamais conclure à une régression sur un
  lancement parallèle.
- Un `npm run check-types` qui échoue laisse des `.d.ts` périmés à côté des
  sources (le script émet les déclarations). Ils masquent ensuite les vrais
  types et produisent des erreurs fantômes. Après un échec :
  `rm -f tsconfig.check.tsbuildinfo && find src -name '*.d.ts' -delete`.

## Sécurité

- Les rapports d'audit ne se commitent pas : le dépôt est public et ils
  décrivent des failles exploitables en production. Seules les notes par lot
  vont dans `api/docs/`, et elles décrivent ce qui est **corrigé**.
- Avant d'affirmer qu'un constat est réel, relire le code concerné pour le
  confirmer. Les numéros de ligne des rapports dérivent vite.
