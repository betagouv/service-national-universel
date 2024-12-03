#!/bin/bash

sleep 10

echo ""
echo "==============================="
echo "= Initialize Replica Set..."
echo "==============================="
mongosh $MONGO_LOCAL_URL --eval "rs.initiate()"
if [[ $? -ne 0 ]]
then
    # Exit with non-error when replicaset is already initialized
    exit 0
fi

echo ""
echo "==============================="
echo "= Setup Elastic search..."
echo "==============================="
./elastic-search/scripts/install.sh

echo ""
echo "==============================="
echo "= Restoring database $DUMP_DIRECTORY ..."
echo "==============================="
# Takes the first subdirectory as database name
subdir=$(find $DUMP_DIRECTORY -type d -maxdepth 1 -mindepth 1 | head -n 1)
db_name=$(basename $subdir)
mongorestore --gzip --nsFrom=$db_name --nsTo=snu_dev $MONGO_LOCAL_URL $DUMP_DIRECTORY/$db_name
