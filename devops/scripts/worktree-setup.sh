#!/usr/bin/env bash
#
# Prépare un worktree fraîchement créé (ou réutilisé) pour qu'il soit
# RÉELLEMENT isolé.
#
# Problème résolu : `.claude/settings.local.json` liste plusieurs répertoires
# dans `worktree.symlinkDirectories` (`node_modules` racine, mais aussi
# `apiv2/node_modules`, `api/node_modules`, `packages/lib/node_modules`, etc.).
# Un lien direct vers le répertoire du dépôt PRINCIPAL fait que `snu-lib`
# (`-> ../packages/lib`) résout vers le `packages/lib` du principal, modifs
# non commitées comprises — ce qui annule l'isolation. Et certains de ces
# répertoires, dans le principal lui-même, contiennent des coquilles VIDES
# pour des paquets pourtant listés (ex. `api/node_modules/mongoose`, 0
# fichier) : un miroir naïf entrée par entrée les copierait telles quelles,
# et la résolution retomberait alors sur une AUTRE version du paquet plus
# haut dans l'arborescence (ex. mongoose 5 racine au lieu du 7 attendu par
# `api`, ou du 8 attendu par `apiv2`) sans erreur bruyante.
#
# Ce script :
#   1. remplace le lien racine par une « ferme de liens » (répertoire réel,
#      un lien par paquet du principal, zéro duplication sur disque), sauf
#      les paquets du workspace qui doivent pointer vers CE worktree ;
#   2. fait de même pour chaque `.../node_modules` de `worktree.symlink
#      Directories`, en ignorant les entrées vides du principal au profit
#      d'une source de repli valide (`packages/lib/node_modules`, puis
#      `node_modules` racine), et en ne touchant jamais aux entrées déjà
#      correctes (idempotent, y compris sur un worktree réutilisé dont ces
#      répertoires existent déjà, même incomplets) ;
#   3. exclut toujours `snu-lib`, `@snu/ds` et `@snu/log-redaction` de ces
#      miroirs : ils doivent résoudre vers CE worktree, jamais vers un
#      sous-`node_modules` ;
#   4. construit ces paquets, puis vérifie bloquant : résolution de
#      `snu-lib` (racine, `apiv2/`, `api/`) et version de `mongoose` requise
#      par `apiv2/` (8.x) et par `api/` (7.x, via `packages/lib`).
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

# Noms des paquets du workspace : ils ne doivent JAMAIS être miroirés depuis
# un sous-node_modules du principal, seulement pointés vers CE worktree.
WORKSPACE_PKG_NAMES=()
for dir in packages/*/; do
  [ -f "$dir/package.json" ] || continue
  WORKSPACE_PKG_NAMES+=("$(node -p "require('./$dir/package.json').name")")
done

is_workspace_pkg_name() {
  local name="$1"
  for n in "${WORKSPACE_PKG_NAMES[@]}"; do
    [ "$n" = "$name" ] && return 0
  done
  return 1
}

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
  echo "  ferme de liens (racine) : $(ls node_modules | wc -l | tr -d ' ') entrées"
else
  echo "  node_modules (racine) n'est pas un lien, rien à faire"
fi

# 2. Ferme de liens pour chaque node_modules de workspace listé dans
#    worktree.symlinkDirectories (hors node_modules racine, traité ci-dessus).
#    Entrée par entrée, sans écraser ce qui est déjà valide (idempotent).

is_valid_pkg_entry() {
  # Existe et n'est pas une coquille vide.
  local p="$1"
  [ -e "$p" ] || return 1
  if [ -d "$p" ]; then
    [ -n "$(ls -A "$p" 2>/dev/null)" ]
  else
    [ -f "$p" ] || [ -L "$p" ]
  fi
}

resolve_fallback_source() {
  # $1 = chemin relatif du node_modules du workspace (ex: api/node_modules)
  # $2 = nom du paquet, éventuellement scope/nom (ex: @types/node)
  local rel="$1" name="$2"
  for candidate in \
    "$MAIN/$rel/$name" \
    "$MAIN/packages/lib/node_modules/$name" \
    "$MAIN/node_modules/$name"
  do
    if is_valid_pkg_entry "$candidate"; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

ensure_farm_entry() {
  # $1 = chemin relatif du node_modules (ex: api/node_modules)
  # $2 = nom du paquet (ex: mongoose ou @nestjs/core)
  local rel="$1" name="$2"
  local target="$WORKTREE/$rel/$name"

  if is_workspace_pkg_name "$name"; then
    # Ne jamais laisser un paquet du workspace résoudre depuis un
    # sous-node_modules : il doit remonter vers la ferme racine (ce worktree).
    [ -e "$target" ] && rm -rf "$target"
    return
  fi

  if is_valid_pkg_entry "$target"; then
    return # déjà correct (lien ou copie), on ne touche pas
  fi

  local source
  if ! source="$(resolve_fallback_source "$rel" "$name")"; then
    echo "    ATTENTION : aucune source valide pour $name (ignoré)" >&2
    return
  fi

  rm -rf "$target"
  mkdir -p "$(dirname "$target")"
  ln -s "$source" "$target"
}

ensure_workspace_farm() {
  local rel="$1" # ex: apiv2/node_modules
  local source_dir="$MAIN/$rel"
  [ -d "$source_dir" ] || return

  local target_dir="$WORKTREE/$rel"
  if [ -L "$target_dir" ]; then
    rm "$target_dir"
  fi
  mkdir -p "$target_dir"

  local count=0
  for entry in "$source_dir"/*; do
    [ -e "$entry" ] || continue
    local name
    name="$(basename "$entry")"
    if [[ "$name" == @* ]] && [ -d "$entry" ]; then
      for pkg in "$entry"/*; do
        [ -e "$pkg" ] || continue
        ensure_farm_entry "$rel" "$name/$(basename "$pkg")"
        count=$((count + 1))
      done
    else
      ensure_farm_entry "$rel" "$name"
      count=$((count + 1))
    fi
  done
  echo "  $rel : $count entrées traitées"
}

MANAGED_DIRS="$(node -p "
  require('$WORKTREE/.claude/settings.local.json').worktree.symlinkDirectories
    .filter(d => d !== 'node_modules')
    .join('\n')
")"
while IFS= read -r rel; do
  [ -n "$rel" ] || continue
  ensure_workspace_farm "$rel"
done <<< "$MANAGED_DIRS"

# 3. Les paquets du workspace pointent vers CE worktree
for dir in packages/*/; do
  [ -f "$dir/package.json" ] || continue
  name="$(node -p "require('./$dir/package.json').name")"
  rm -rf "node_modules/$name"
  mkdir -p "$(dirname "node_modules/$name")"
  ln -sfn "$WORKTREE/${dir%/}" "node_modules/$name"
  echo "  $name -> ${dir%/} (worktree)"
done

# 4. Construire ces paquets : sans dist, l'API ne compile pas
for dir in packages/*/; do
  [ -f "$dir/package.json" ] || continue
  if node -p "Object.keys(require('./$dir/package.json').scripts||{}).includes('build')" | grep -q true; then
    echo "  build ${dir%/}"
    (cd "$dir" && npm run build >/dev/null)
  fi
done

echo
echo "Isolation vérifiée :"

check_snu_lib_from() {
  local dir="$1" out
  if ! out="$(cd "$WORKTREE/$dir" && node -e "console.log(require.resolve('snu-lib'))" 2>&1)"; then
    echo "  ECHEC : snu-lib introuvable depuis $dir/" >&2
    echo "$out" >&2
    exit 1
  fi
  case "$out" in
    "$WORKTREE"/*) echo "  snu-lib (depuis $dir/) -> $out" ;;
    *)
      echo "  ECHEC : snu-lib résout hors du worktree depuis $dir/ ($out)" >&2
      exit 1
      ;;
  esac
}

check_mongoose_major_from() {
  local dir="$1" expected="$2" out major
  if ! out="$(cd "$WORKTREE/$dir" && node -p "require('mongoose/package.json').version" 2>&1)"; then
    echo "  ECHEC : mongoose introuvable depuis $dir/" >&2
    echo "$out" >&2
    exit 1
  fi
  major="${out%%.*}"
  if [ "$major" != "$expected" ]; then
    echo "  ECHEC : mongoose depuis $dir/ = $out (attendu ${expected}.x)" >&2
    exit 1
  fi
  echo "  mongoose (depuis $dir/) -> $out"
}

check_snu_lib_from "."
check_snu_lib_from "apiv2"
check_snu_lib_from "api"
check_mongoose_major_from "apiv2" "8"
check_mongoose_major_from "api" "7"

echo "  OK"
