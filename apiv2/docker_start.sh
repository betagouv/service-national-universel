#!/bin/sh

set -e

if [[ $ENVIRONMENT == "production" || $ENVIRONMENT == "staging" || $ENVIRONMENT == "ci" ]]
then
  if [[ $RUN_TASKS == "true" ]]
  then
    # Create a httpserver for healthchecks // TODO : integrates @bull-board/nestjs instead
    node -e 'http.createServer((req, res) => {res.end(process.env.RELEASE)}).listen(process.env.PORT)' &
    exec node apiv2/dist/mainJob.js
  else
    exec node apiv2/dist/main.js
  fi
else
  RUN_TASKS=true node apiv2/dist/mainJob.js &
  exec node apiv2/dist/main.js
fi
