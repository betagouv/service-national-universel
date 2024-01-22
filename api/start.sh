#!/bin/sh

# Start ClamAV daemon
clamd &

sleep 10
# Start your Node.js application
exec npm start
