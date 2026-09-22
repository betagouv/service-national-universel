#!/usr/bin/env bash
#
# Prépare un worktree fraîchement créé pour qu'il soit RÉELLEMENT isolé.
#
# Problème résolu : `.claude/settings.local.json` liste `node_modules` dans
# `worktree.symlinkDirectories`. Le lien racine fait que `node_modules/snu-lib`
# (`-> ../packages/lib`) résout vers le `packages/lib` du dépôt PRINCIPAL. Un
# worktree compile donc contre le paquet partagé d'à côté, modifications non
# commitées comprises — ce qui annule l'isolation pour tout ce qui touche
# `snu-lib`, `@snu/ds` ou `@snu/log-redaction`.
#
# Ce script remplace le lien racine par une « ferme de liens » : un vrai
# répertoire contenant un lien par paquet du dépôt principal (donc toujours zéro
# duplication sur disque), sauf les paquets du workspace qui pointent vers CE
# worktree. Puis il les construit.
#
# Usage, depuis la racine du worktree :
#   bash devops/scripts/worktree-setup.sh
#
set -euo pipefail

WORKTREE="$(pwd)"
MAIN="$(git worktree list --porcelain | head -1 | sed 's|^worktree ||')"

if [ "$WORKTREE" = "$MAIN" ]; then
  echo "Ce script s'exécute dans un worktree, pas dans le dépôt principal." >&2
  exit 1
fi

echo "worktree : $WORKTREE"
echo "principal: $MAIN"

# 1. Ferme de liens à la racine
if [ -L node_modules ]; then
  rm node_modules
  mkdir node_modules
  for entry in "$MAIN"/node_modules/*; do
    ln -s "$entry" "node_modules/$(basename "$entry")"
  done
  # les scopes doivent être de vrais répertoires pour que @scope/pkg résolve
  for scope in "$MAIN"/node_modules/@*; do
    [ -d "$scope" ] || continue
    s="$(basename "$scope")"
    rm -f "node_modules/$s"
    mkdir -p "node_modules/$s"
    for pkg in "$scope"/*; do
      ln -s "$pkg" "node_modules/$s/$(basename "$pkg")"
    done
  done
  ln -sfn "$MAIN/node_modules/.bin" node_modules/.bin
  echo "  ferme de liens : $(ls node_modules | wc -l | tr -d ' ') entrées"
else
  echo "  node_modules n'est pas un lien, rien à faire"
fi

# 2. Les paquets du workspace pointent vers CE worktree
for dir in packages/*/; do
  [ -f "$dir/package.json" ] || continue
  name="$(node -p "require('./$dir/package.json').name")"
  rm -rf "node_modules/$name"
  mkdir -p "$(dirname "node_modules/$name")"
  ln -sfn "$WORKTREE/${dir%/}" "node_modules/$name"
  echo "  $name -> ${dir%/} (worktree)"
done

# 3. Construire ces paquets : sans dist, l'API ne compile pas
for dir in packages/*/; do
  [ -f "$dir/package.json" ] || continue
  if node -p "Object.keys(require('./$dir/package.json').scripts||{}).includes('build')" | grep -q true; then
    echo "  build ${dir%/}"
    (cd "$dir" && npm run build >/dev/null)
  fi
done

echo
echo "Isolation vérifiée :"
node -e "
const p = require.resolve('snu-lib');
console.log('  snu-lib -> ' + p);
if (!p.startsWith(process.cwd())) { console.error('  ECHEC : resout hors du worktree'); process.exit(1); }
console.log('  OK');
"
