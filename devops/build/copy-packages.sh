#!/bin/bash
#
# Recopie des paquets du workspace (packages/*) vers l'artefact de déploiement.
# Fonction partagée par build.sh et build-all.sh.

# copy_workspace_packages <destination>
#
# `node_modules/` ne contient que des liens symboliques vers `packages/<nom>`. Si la cible
# n'est pas recopiée, le lien pend et `require()` lève MODULE_NOT_FOUND au démarrage — sans
# que rien ne l'ait signalé au build.
#
# `turbo prune` a déjà élagué `out/packages/` au strict nécessaire pour l'application : on
# recopie donc tout ce qui s'y trouve, plutôt que d'énumérer les paquets un par un. Tout
# nouveau paquet du workspace est ainsi embarqué sans avoir à toucher à ce script.
#
# Convention de disposition, celle de snu-lib éprouvée en production : `dist/` est aplati à
# la racine du répertoire du paquet et son `package.json` n'est pas recopié. Node, ne
# trouvant pas de manifeste, retombe sur `index.js`.
copy_workspace_packages() {
    local destination=$1
    local package
    local name

    if [[ ! -d out/packages ]]; then
        return 0
    fi

    for package in out/packages/*/; do
        [[ -d $package ]] || continue
        name=$(basename "$package")

        if [[ ! -d ${package}dist ]]; then
            echo "ERROR: le paquet $name n'a pas de répertoire dist/ — son build a-t-il tourné ?" >&2
            exit 1
        fi

        mkdir -p "$destination/packages/$name"
        mv "${package}dist"/* "$destination/packages/$name/"

        # Un paquet sans dépendance de runtime n'a pas de node_modules après npm ci --omit dev.
        if [[ -d ${package}node_modules ]]; then
            mv "${package}node_modules" "$destination/packages/$name/"
        fi
    done
}
