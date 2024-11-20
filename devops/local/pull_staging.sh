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
PROJECT_DIR=$(cd $SCRIPT_DIR/../../ && pwd)

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
MONGO_STAGING_URL=$($PROJECT_DIR/api/src/scripts/get_secrets.sh snu-ci | jq -r ".MONGO_URL")
MONGO_STAGING_NAME=bmwmw2zjc1t8eoc2zfy3
MONGO_LOCAL_NAME=snu_dev
printf '\nDo you want to use mongo replica set (y/N)? '
read answer
if [ "$answer" = "${answer#[Yy]}" ] ;then 
    echo "Using single instance..."
    MONGO_LOCAL_URL="mongodb://localhost:27017/$MONGO_LOCAL_NAME";
    USE_REPLICA_SET=0
else
    echo "Using multiple instance (replica set) $answer..."
    MONGO_LOCAL_URL="mongodb://root:password123@localhost:27017/$MONGO_LOCAL_NAME?replicaSet=rs0&authSource=admin&directConnection=true";
    USE_REPLICA_SET=1
fi

export ES_ENDPOINT=localhost:9200

echo "= DUMP DIR   : $DUMP_DIRECTORY\n"
echo "> DUMP FROM  : $MONGO_STAGING_URL"
echo "> RESTORE TO : $MONGO_LOCAL_URL"
echo "> REINDEXING TO : $ES_ENDPOINT"

if [ -z "$MONGO_STAGING_URL" ];then
  echo "MONGO_STAGING_URL is empty"
  exit 1  
fi
if [[ $(echo $MONGO_STAGING_URL | grep production) ]]
then
    echo "The dumping database URI contains the pattern 'production'. Aborting ..."
    exit 1
fi

printf '\nIs this all good (y/n)? '
read answer
if [ "$answer" = "${answer#[Yy]}" ] ;then 
    echo "Aborting..."
    exit 1
fi

echo ""
echo "==============================="
echo "= Pulling database..."
echo "==============================="

###
# Dump staging database in local
###
if [ ! -d $DUMP_DIRECTORY ];then
    mkdir $DUMP_DIRECTORY
fi
rm -fr $DUMP_DIRECTORY/*
mongodump --gzip --out=$DUMP_DIRECTORY $MONGO_STAGING_URL

echo ""
echo "==============================="
echo "= Restoring database..."
echo "==============================="
###
# restore local dump in local database
###
mongorestore --drop --gzip $MONGO_LOCAL_URL $DUMP_DIRECTORY/$MONGO_STAGING_NAME

echo ""
echo "==============================="
echo "= Request full index rebuild..."
echo "==============================="
if [ $USE_REPLICA_SET -eq 1 ];then
  echo "Restarting ES datariver..."
  docker-compose -f docker-compose.replica.yml stop es_datariver
  mongosh $MONGO_LOCAL_URL --eval "db.monstache.drop()"
  ../ES_datariver/uninstall.sh
  ../ES_datariver/install.sh
  docker-compose -f docker-compose.replica.yml restart es_datariver
else
  echo "Running old script reindex_es_all_models"
  cd $PROJECT_DIR/api
  npx ts-node ./src/scripts/reindex_es_all_models/index.js
fi
