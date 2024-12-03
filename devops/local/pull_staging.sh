#/bin/zsh
set -o pipefail
set -e

# requirements
# mongoDB database tools
if ! [[ -x "$(command -v mongodump)" ]]; then
  echo 'ERROR: mongodump, bsondump & mongoimport are not installed : https://www.mongodb.com/docs/database-tools/' >&2
  exit 1
fi
if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq not installed install : brew install jq' >&2
  exit 1
fi

dirname=$(dirname $0)

MONGO_STAGING_URL=$(node $dirname/../scripts/get-secrets.js snu-ci ci-api-run -f "json" | jq -r ".MONGO_URL")
DUMP_DIRECTORY="$dirname/dump"

mongodump --gzip --out=$DUMP_DIRECTORY $MONGO_STAGING_URL
