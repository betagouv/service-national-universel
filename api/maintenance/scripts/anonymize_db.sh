#!/bin/bash

if [ "$#" -lt 2 ]; then
    echo "Anonymize data and export to destination database"
    echo "Usage $0 <source> <destination_db>"
    echo "  source: "
    echo "    - Path to a local directory containing database dump"
    echo "    - URI of a source database to dump"
    echo "  destination_db: Destination database URI"
    exit 1
fi

source=$1
dst_db_uri=$2

if [[ $source == "" ]]
then
    echo "You must specify the source"
    exit 1
fi

if [[ $dst_db_uri == "" ]]
then
    echo "You must specify the destination database URI"
    exit 1
fi

# requirements
# mongoDB database tools
if ! [[ -x "$(command -v mongodump)" ]]; then
  echo 'ERROR: mongodump, bsondump & mongoimport are not installed : https://www.mongodb.com/docs/database-tools/' >&2
  exit 1
fi

set -o pipefail
set -e


if [[ -d $source ]]
then
    echo "Dump directory found"
    dump_dir=$source
    remove_dump_dir="false"
else
    echo "Dump directory not found. Generating dump from source database URI"
    dump_dir=$(uuidgen)
    remove_dump_dir="true"

    mongodump --quiet --gzip --out=$dump_dir $src_db_uri
fi

db_name=$(ls -l1 $dump_dir | head -n 1)


echo "Drop collections"

drop_collections_filename=$(uuidgen)
cat > $drop_collections_filename <<EOF
_patches
emails
EOF

ls -l1 $dump_dir/$db_name/*.bson.gz \
| grep --file="$drop_collections_filename" \
| while read filename
do
    collection=$(basename $filename ".bson.gz")
    echo "Dropping $collection"
    echo "" \
    | mongoimport --quiet --drop --collection="$collection" $dst_db_uri
done


echo "Import collections"

ls -l1 $dump_dir/$db_name/*.bson.gz \
| grep --invert-match --file="$drop_collections_filename" \
| while read filename
do
    collection=$(basename $filename ".bson.gz")
    echo "Importing $collection"
    cat $filename \
    | gunzip \
    | bsondump \
    | node "$(dirname $0)/utils/anonymize_collection.js" \
    | mongoimport --quiet --drop --collection="$collection" $dst_db_uri
done


rm $drop_collections_filename
if [[ $remove_dump_dir == "true" ]]
then
    echo "Remove $dump_dir"
    rm -Rf $dump_dir
fi
