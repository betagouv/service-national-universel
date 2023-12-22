#!/bin/sh

# TODO :
# Use import-meta-env to substitute at runtime
# Link: https://import-meta-env.org/guide/getting-started/introduction.html#guide

# Use \x07 character as delimiter
delim=$(echo -ne "\x07")
# Create the sed command to substituate in one pass every environment variables prefixed by DOCKER_ENV_
command=$(env | grep DOCKER_ENV_ | sed "s/^\(.*\)=\(.*\)$/-e ###s$delim\1$delim\2${delim}g###/g" | xargs echo sed -i.bak | sed 's/###/\"/g')
# Apply the substitution only on the index-*.js file
eval $command $(find /service-national-universel/app/build/assets -name "index-*.js" -type f | head -n 1)
