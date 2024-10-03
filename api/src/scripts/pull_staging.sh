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

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR=$(cd $SCRIPT_DIR/../../../ && pwd)

echo "= ENV FILE   : $PROJECT_DIR/.env"
source $PROJECT_DIR/.env
if [ -z "$SCW_SECRET_KEY" ];then
  echo "SCW_SECRET_KEY is empty, check your .env file"
fi
if [ -z "$CI_PROJECT_ID" ];then
  echo "CI_PROJECT_ID is empty, check your .env file"
fi
export SCW_SECRET_KEY
export SCW_PROJECT_ID=$CI_PROJECT_ID

DUMP_DIRECTORY="$SCRIPT_DIR/dump"
MONGO_STAGING_URL=$(./get_secrets.sh snu-ci | jq -r ".MONGO_URL")
MONGO_STAGING_NAME=bmwmw2zjc1t8eoc2zfy3
MONGO_LOCAL_NAME=local_app
MONGO_LOCAL_URL="mongodb://localhost:27017/$MONGO_LOCAL_NAME";

echo "= DUMP DIR   : $DUMP_DIRECTORY\n"
echo "> DUMP FROM  : $MONGO_STAGING_URL"
echo "> RESTORE TO : $MONGO_LOCAL_URL"
echo "> REINDEXING according to local-development.js configuration"

if [ -z "$MONGO_STAGING_URL" ];then
  echo "MONGO_STAGING_URL is empty"
  exit 1  
fi
if [[ $(echo $MONGO_STAGING_URL | grep production) ]]
then
    echo "The dumping database URI contains the pattern 'production'. Aborting ..."
    exit 1
fi

echo -n '\nIs this all good (y/n)? '
read answer
if [ "$answer" = "${answer#[Yy]}" ] ;then 
    echo "Aborting..."
    exit 1
fi
echo "Pulling database..."

###
# Dump staging database in local
###
if [ ! -d $DUMP_DIRECTORY ];then
    mkdir $DUMP_DIRECTORY
fi
rm -fr $DUMP_DIRECTORY/*
mongodump --gzip --out=$DUMP_DIRECTORY $MONGO_STAGING_URL

###
# restore local dump in local database
###
mongorestore --drop --gzip $MONGO_LOCAL_URL $DUMP_DIRECTORY/$MONGO_STAGING_NAME

###
# reindex all models
###
echo "REINDEXING ES"
cd $PROJECT_DIR/api
npx ts-node ./src/scripts/reindex_es_all_models/index.js
