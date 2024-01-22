#!/bin/sh
set -e
# Start ClamAV daemon
clamd --foreground &

# Start your Node.js application
exec npm start
