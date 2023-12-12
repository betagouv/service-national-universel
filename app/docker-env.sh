#!/bin/sh
for i in $(env | grep DOCKER_ENV_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value
    # sed All files
    find /service-national-universel/app/build -type f -exec sed -i "s|${key}|${value}|g" '{}' +

    # sed JS and CSS only
    # find /service-national-universel/app/build -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done
