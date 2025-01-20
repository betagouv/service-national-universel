#!/bin/sh

set -e

config=apiv2/docker_supervisord_api_and_tasks.ini

if [[ $ENVIRONMENT == "production" || $ENVIRONMENT == "staging" || $ENVIRONMENT == "ci" ]]
then
  if [[ $RUN_TASKS == "true" ]]
  then
    config=apiv2/docker_supervisord_tasks.ini
  else
    config=apiv2/docker_supervisord_api.ini
  fi
fi

exec supervisord --configuration=$config
