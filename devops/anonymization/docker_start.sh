#!/bin/bash

cd "$(dirname $0)"

set -o pipefail
set -e

failure=0

while read row
do
  if [[ ${!row} == "" ]]
  then
      echo "$row is not defined"
      failure=1
  fi
done < <(cut -d "=" -f 1  env-example)

(( $failure )) && exit 1

if ! [[ -x "$(command -v monstache)" ]]; then
  echo 'ERROR: monstache is not installed : https://github.com/rwynn/monstache' >&2
  exit 1
fi

if ! [[ -x "$(command -v clever)" ]]; then
  echo 'ERROR: clever is not installed : https://github.com/CleverCloud/clever-tools/blob/master/docs/setup-systems.md' >&2
  exit 1
fi

echo "Login to CC"
clever login --token=$CC_TOKEN --secret=$CC_SECRET

echo "Stop datariver application"
clever stop --app $DATARIVER_APP_ID

if [[ $ANONYMIZE_DB == "true" ]]
then
  echo "Start anonymization"
  ./anonymize_db.sh $SOURCE_DATABASE_URI $TARGET_DATABASE_URI
fi

if [[ $DELETE_ES_INDEXES == "true" ]]
then
  echo "Remove elastic search indexes"
  cat config/index_whitelist.txt \
  | while read name
  do
      echo "Deleting index $name"
      curl -sSw "\n" -X DELETE "$ES_ENDPOINT/$name"
  done
fi

echo "Start elastic search full synchronization with monstache"
DB_NAME=$(echo "$TARGET_DATABASE_URI" | sed 's#^.*/\([a-zA-Z0-9]*\)?.*$#\1#')
DB_NAME=$DB_NAME envsubst < config/monstache-template.toml > config/monstache.toml

MONSTACHE_ES_URLS=$ES_ENDPOINT MONSTACHE_MONGO_URL=$TARGET_DATABASE_URI monstache -f config/monstache.toml

echo "Restart datariver application"
clever restart --quiet --app $DATARIVER_APP_ID
