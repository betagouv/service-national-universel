#!/bin/bash

clever login --token=$CC_TOKEN --secret=$CC_SECRET
clever stop --app $DATARIVER_APP_ID
sleep 10
clever restart --app $DATARIVER_APP_ID

exit 1

if [[ $SOURCE_DATABASE_URI == "" || $TARGET_DATABASE_URI == "" || $ES_ENDPOINT == "" ]]
then
    echo "You must specify SOURCE_DATABASE_URI, TARGET_DATABASE_URI and ES_ENDPOINT in your environment"
    exit 1
fi

if ! [[ -x "$(command -v monstache)" ]]; then
  echo 'ERROR: monstache is not installed : https://github.com/rwynn/monstache' >&2
  exit 1
fi

if ! [[ -x "$(command -v clever)" ]]; then
  echo 'ERROR: clever is not installed : https://github.com/CleverCloud/clever-tools/blob/master/docs/setup-systems.md' >&2
  exit 1
fi

cd "$(dirname $0)"

set -o pipefail
set -e

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