#!/bin/sh

set -e

if [[ $ENVIRONMENT != "production" && $ENVIRONMENT != "staging" && $ENVIRONMENT != "ci" ]]
then
  RUN_TASKS=true PORT=8087 node apiv2/dist/mainJob.js &
  exec node apiv2/dist/main.js
else
  if [[ $RUN_TASKS == "true" ]]
  then
    exec node apiv2/dist/mainJob.js
  else
    exec node apiv2/dist/main.js
  fi
fi
