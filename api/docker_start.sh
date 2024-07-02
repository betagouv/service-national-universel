#!/bin/bash

config=$(node -e 'console.log(JSON.stringify(require("config")))')

PM2_SLACK_URL=$(echo $config | jq -r '.PM2_SLACK_URL')

if [[ $PM2_SLACK_URL == "" ]]
then
  echo "PM2_SLACK_URL is not defined"
else
  pm2 --no-daemon multiset "pm2-slack:slack_url $PM2_SLACK_URL pm2-slack:servername PM2-ERROR-API"
fi


exec pm2-runtime --no-autorestart api/src/index.js
