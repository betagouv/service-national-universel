#!/bin/sh

# TODO :
# Use import-meta-env to substitute at runtime
# Link: https://import-meta-env.org/guide/getting-started/introduction.html#guide

# Create the sed command to substituate in one pass every environment variables prefixed by DOCKER_ENV_

file=$(find /service-national-universel/admin/build/assets -name "index-*.js" -type f | head -n 1)
for i in $(env | grep DOCKER_ENV_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value
    sed -i "s|${key}|${value}|g" $file
done
