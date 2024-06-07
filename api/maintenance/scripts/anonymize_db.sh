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

drop_collections_filename=$(uuidgen)
cat > $drop_collections_filename <<EOF
emails
alertemessages
events
tags
sessionphase1tokens
knowledgebases
snutags
stats-young-centers
support_tags
support_users
templates
tickets
zammadtickets
alerte_message_patches
application_patches
classe_patches
cohesioncenter_patches
cohort_patches
contract_patches
departmentservice_patches
etablissement_patches
filter_patches
importplandetransport_patches
inscriptiongoal_patches
knowledgebase_patches
lignebus_patches
lignetopoint_patches
meetingpoint_patches
mission_patches
missionapi_patches
missionequivalence_patches
modificationbus_patches
plandetransport_patches
pointderassemblement_patches
program_patches
referent_patches
schemaderepartition_patches
schoolramses_patches
sessionphase1_patches
sessionphase1token_patches
snutag_patches
structure_patches
tablederepartition_patches
tag_patches
ticket_patches
young_patches
EOF


if [[ -d $source ]]
then
    echo "Dump directory found"
    dump_dir=$source
    remove_dump_dir="false"
else
    echo "Dump directory not found. Generating dump from source database URI"
    dump_dir=$(uuidgen)
    remove_dump_dir="true"

    mongodump --gzip $(cat $drop_collections_filename | sed 's/\(.*\)/--excludeCollection=\1/g' | tr '\n' ' ') --out=$dump_dir $source
fi

db_name=$(ls -1 $dump_dir | head -n 1)


echo "Drop collections"

cat $drop_collections_filename \
| while read collection
do
    echo "Dropping $collection"
    continue # TODO: Remove
    echo "" \
    | mongoimport --drop --collection="$collection" $dst_db_uri
done


echo "Import collections"

ls -1 $dump_dir/$db_name/*.bson.gz \
| grep -vwf "$drop_collections_filename" \
| while read filename
do
    collection=$(basename $filename ".bson.gz")
    echo "Importing $collection"
    continue # TODO: Remove
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
