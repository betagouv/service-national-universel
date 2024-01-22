#!/bin/sh

# Start ClamAV daemon
clamd --foreground &

sleep 10
# Start your Node.js application
npm start
