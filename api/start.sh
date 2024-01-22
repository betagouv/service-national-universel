#!/bin/sh

# Start ClamAV daemon
clamd --foreground &

# Start your Node.js application
npm start
