#!/bin/sh

# Start ClamAV daemon
clamd

# Start your Node.js application
exec npm start
