#!/bin/bash

set -e


if [ "$#" -lt 2 ]; then
    echo "Generate monstache configuration"
    echo "Usage $0 <db_name> <file>"
    echo "  db_name: Source database name"
    echo "  file: Collection mapping filename"
    exit 1
fi

db_name=$1
col_file=$2

if [[ $db_name == "" ]]
then
    echo "You must specify the database name"
    exit 1
fi

if [[ ! -f "$col_file" ]]
then
    echo "file mut be a valid filename"
    exit 1
fi

collections=$(tail -n +2 $col_file | cut -d "," -f 1 | sed "s/^\(.*\)$/\"$db_name.\1\",/g")

cat <<EOF
workers = ["default", "young"]
verbose = false
prune-invalid-json = true
cluster-name = 'sync_mongo_es'

change-stream-namespaces = [
$collections
]

direct-read-stateful = true
direct-read-concur = 1

direct-read-namespaces = [
$collections
]

EOF

tail -n +2 $col_file \
| while read row
do
    index=$(echo $row | cut -d "," -f 2)
    collection=$(echo $row | cut -d "," -f 1)
    echo "[[mapping]]"
    echo "namespace = \"$db_name.$collection\""
    echo "index = \"$index\""
    echo ""
done
