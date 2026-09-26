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
liste dans `worktree.symlinkDirectories` le `node_modules` racine, mais aussi
ceux de `packages/lib`, `packages/ds`, `api`, `apiv2`, `app`, `admin`,
`snupport-api` et `snupport-app`. Un lien direct vers ces répertoires du
checkout principal ferait résoudre `snu-lib` (`-> ../packages/lib`) vers le
`packages/lib` du principal — modifications non commitées d'autres sessions
comprises. Pire : certains de ces répertoires contiennent, **dans le principal
lui-même**, des coquilles vides pour des paquets pourtant listés (ex.
`api/node_modules/mongoose`, 0 fichier) ; un miroir naïf les copierait telles
quelles, et la résolution retomberait alors sur une autre version du même
paquet plus haut dans l'arborescence, sans erreur bruyante (mongoose 5 racine
au lieu du 7 attendu par `api`, ou de la version 8 attendue par `apiv2`).

Le script remplace chacun de ces répertoires par une ferme de liens (zéro
duplication sur disque, entrée par entrée, sans toucher aux entrées déjà
valides — donc rejouable sur un worktree réutilisé même partiellement monté).
Il ignore une entrée vide du principal au profit d'une source de repli valide
(`packages/lib/node_modules`, puis `node_modules` racine), exclut toujours
`snu-lib`, `@snu/ds` et `@snu/log-redaction` de ces miroirs (ils doivent
remonter vers CE worktree), construit ces paquets, puis vérifie de façon
bloquante la résolution de `snu-lib` (racine, `apiv2/`, `api/`) et la version
de `mongoose` requise par `apiv2/` (8.x) et par `api/` (7.x, via
`packages/lib`).

Pour vérifier à tout moment qu'on est bien isolé :

```bash
node -e "console.log(require.resolve('snu-lib'))"
(cd apiv2 && node -p "require('mongoose/package.json').version")  # doit être 8.x
(cd api && node -p "require('mongoose/package.json').version")    # doit être 7.x
```

Le chemin de `snu-lib` doit contenir le nom du worktree.

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
- Un rapport d'audit (et tout document dérivé : lots de PR, tickets, synthèses)
  s'écrit directement dans un emplacement privé hors du dépôt, jamais dans le
  worktree : celui-ci ne garde qu'une copie locale de travail, jetable.
  `git worktree prune`, la suppression de `.claude/worktrees/` ou
  `ExitWorktree` peuvent le faire disparaître sans préavis (voir GOO-94).
- Avant d'affirmer qu'un constat est réel, relire le code concerné pour le
  confirmer. Les numéros de ligne des rapports dérivent vite.
