#!/bin/sh

set -ex

# Start ClamAV daemon
clamd

# Start your Node.js application
exec npm start
