#!/bin/bash
#
# Adresse de collecte des violations de la CSP des fronts (directive `report-uri`).
# Fonction partagée par build.sh et build-all.sh.

# csp_report_uri <application>
#
# La politique cible des fronts est servie en `Content-Security-Policy-Report-Only` : sans
# adresse de collecte, le navigateur ne signale ses violations qu'à la console de l'usager, et
# rien ne permet de savoir si la politique peut passer en mode bloquant (FM27, GOO-17).
#
# Les violations partent vers l'endpoint « security » du projet Sentry de chaque front. Le DSN
# est lu dans `<application>/src/sentry.js`, le même que celui du bundle : sa clé est publique,
# et un changement de projet Sentry suit sans toucher à ce script. Chaque rapport est étiqueté
# avec l'environnement du build (VITE_ENVIRONMENT) et sa release (VITE_RELEASE).
#
# `report-uri` plutôt que `report-to` : c'est la directive que lisent tous les navigateurs
# (Firefox n'applique pas `report-to` à la CSP), et Chrome la suit tant que `report-to` est
# absent.
#
# À appeler depuis la racine du dépôt.
csp_report_uri() {
    local application=$1
    local dsns

    dsns=$(grep -oE 'https://[0-9a-f]+@sentry\.incubateur\.net/[0-9]+' "$application/src/sentry.js" 2>/dev/null | sort -u)
    if [[ $(echo "$dsns" | grep -c .) != 1 ]]; then
        echo "csp_report_uri : DSN Sentry introuvable ou ambigu dans $application/src/sentry.js" >&2
        return 1
    fi

    local key=${dsns#https://}
    key=${key%%@*}
    local project=${dsns##*/}

    local uri="https://sentry.incubateur.net/api/$project/security/?sentry_key=$key"
    if [[ $VITE_ENVIRONMENT != "" ]]; then
        uri="$uri&sentry_environment=$VITE_ENVIRONMENT"
    fi
    if [[ $VITE_RELEASE != "" ]]; then
        uri="$uri&sentry_release=$VITE_RELEASE"
    fi
    echo "$uri"
}
