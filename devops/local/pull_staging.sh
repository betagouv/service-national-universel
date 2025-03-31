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

if [[ $MONGO_URL == "" ]]
then
    echo "You must specify the MONGO_URL environment variable"
    exit 1
fi

dirname=$(dirname $0)

DUMP_DIRECTORY="$dirname/dump"

mongodump --gzip --out=$DUMP_DIRECTORY $MONGO_URL
