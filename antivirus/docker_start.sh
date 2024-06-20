#!/bin/sh

set -ex

# Start ClamAV daemon
clamd --log=/dev/stdout

# Start your Node.js application
exec node antivirus/index.js
