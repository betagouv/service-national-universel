#!/bin/sh
set -e

# Interpolation des variables d'environnement dans le template
envsubst < /etc/heartbeat/heartbeat.yml.template > /etc/heartbeat/heartbeat.yml

# Dummy server pour Clever Cloud
socat TCP-LISTEN:${PORT:-8080},fork,reuseaddr SYSTEM:'echo HTTP/1.1 200 OK; echo; echo OK' &

# Lancer Heartbeat
exec heartbeat -e