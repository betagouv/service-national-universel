#!/bin/sh

set -e

monstache -f monstache.toml -worker default --enable-http-server &
default_pid=$!
monstache -f monstache.toml -worker young &
young_pid=$!

# Arrêt demandé (redémarrage, déploiement) : le relayer aux deux workers pour qu'ils
# libèrent leur verrou de cluster et enregistrent l'état de leur relecture.
trap 'kill -TERM "$default_pid" "$young_pid" 2>/dev/null' TERM INT

# Le `/bin/sh` de l'image est BusyBox : son `wait -n` attend TOUS les processus. Un worker
# mort passait inaperçu, et la moitié des documents (hachage par worker) n'était plus
# synchronisée tant que l'autre tournait. On surveille donc les deux explicitement : dès
# que l'un s'arrête, on arrête l'autre et on sort en erreur pour que l'hébergeur redémarre.
while kill -0 "$default_pid" 2>/dev/null && kill -0 "$young_pid" 2>/dev/null; do
  sleep 5
done

kill -TERM "$default_pid" "$young_pid" 2>/dev/null || true
wait || true

echo "Un worker monstache s'est arrêté : arrêt du conteneur" >&2
exit 1
