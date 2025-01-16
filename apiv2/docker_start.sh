#!/bin/sh

set -e

config=""
if [[ $ENVIRONMENT == "production" || $ENVIRONMENT == "staging" || $ENVIRONMENT == "ci" ]]
then
  if [[ $RUN_TASKS == "true" ]]
  then
    config=apiv2/docker_supervisord_tasks.ini
  else
    config=apiv2/docker_supervisord_api.ini
  fi
else
  config=apiv2/docker_supervisord_api_and_tasks.ini
fi

exec supervisord --configuration=$config
