#!/bin/sh

# Start ClamAV daemon
clamd &

sleep 30

# Start your Node.js application
npm start
