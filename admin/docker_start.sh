#!/bin/bash

set -ex

if [[ $ENVIRONMENT == "" ]]
then
    env="development"
else
    env=$ENVIRONMENT
fi

if [[ $env != "development" ]] && [[ $env != "custom" ]] && [[ $env != "ci" ]] && [[ $env != "staging" ]] && [[ $env != "production" ]]
then
  echo "Invalid environment name : $env"
  exit 1
fi

config=$(cat docker_config/$env.json | tr -d '\n\t ' | envsubst)

cd /usr/share/nginx/html

mv index.html index.html.template

sed "s#\(<noscript> You need to enable JavaScript to run this app. </noscript>\)#\1<script>globalThis.runtime_env=JSON.parse('$config');</script>#" index.html.template > index.html

cd -

# Start nginx
exec /docker-entrypoint.sh nginx -g "daemon off;"
