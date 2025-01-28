#!/bin/sh

set -e

if [[ $ENVIRONMENT != "production" && $ENVIRONMENT != "staging" && $ENVIRONMENT != "ci" ]]
then
  export RUN_API_AND_TASKS=true
fi

exec pm2-runtime --error=/var/log/api.error.log --output=/var/log/api.output.log api/src/index.js
