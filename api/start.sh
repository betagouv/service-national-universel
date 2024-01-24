#!/bin/sh

# Start ClamAV daemon
if [[ $PRODUCTION == "true" ]]
then
    clamd
fi

# Start your Node.js application
exec npm start
