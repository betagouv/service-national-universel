#!/bin/sh

set -e

monstache -f monstache.toml -worker default --enable-http-server &
monstache -f monstache.toml -worker young &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
