#!/bin/sh

set -e

touch /var/log/api.error.log /var/log/api.output.log

if [[ $LOGS_ES_ENDPOINT != "" ]]
then
  LOGS_ES_HOST=$(echo $LOGS_ES_ENDPOINT | sed 's#https://.*:.*@\(.*\)#\1#g') \
  LOGS_ES_USER=$(echo $LOGS_ES_ENDPOINT | sed 's#https://\(.*\):.*@.*#\1#g') \
  LOGS_ES_PASSWORD=$(echo $LOGS_ES_ENDPOINT | sed 's#https://.*:\(.*\)@.*#\1#g') \
  rsyslogd -f api/docker_rsyslog.conf
fi

if [[ $ENVIRONMENT != "production" && $ENVIRONMENT != "staging" && $ENVIRONMENT != "ci" ]]
then
  export RUN_API_AND_TASKS=true
fi

exec pm2-runtime --error=/var/log/api.error.log --output=/var/log/api.output.log api/src/index.js
