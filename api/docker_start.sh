#!/bin/bash

config=$(node -e 'console.log(JSON.stringify(require("config")))')

PM2_SLACK_URL=$(echo $config | jq -r '.PM2_SLACK_URL')

if [[ $PM2_SLACK_URL == "" ]]
then
  echo "PM2_SLACK_URL is not defined"
else
  pm2 --no-daemon multiset "pm2-slack:slack_url $PM2_SLACK_URL pm2-slack:servername PM2-ERROR-API pm2-slack:error false"
fi

touch /var/log/api.error.log /var/log/api.output.log

rsyslogd -f api/docker_rsyslog.conf

exec pm2-runtime --error=/var/log/api.error.log --output=/var/log/api.output.log api/src/index.js
