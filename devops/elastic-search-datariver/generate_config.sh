#!/bin/bash

set -e


if [ "$#" -lt 2 ]; then
    echo "Generate monstache configuration"
    echo "Usage $0 <db_name> <file> [sensitive_file]"
    echo "  db_name: Source database name"
    echo "  file: Collection mapping filename"
    echo "  sensitive_file: Fields stripped before indexing (default: sensitive-fields.csv)"
    exit 1
fi

db_name=$1
col_file=$2
sensitive_file=${3:-sensitive-fields.csv}

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

# Secrets et jetons : ils n'ont aucun usage dans Elasticsearch et ne doivent pas
# y être répliqués. Source de vérité des champs :
# packages/lib/src/constants/elasticsearch.ts
if [[ -f "$sensitive_file" ]]
then
    collections=$(tail -n +2 $sensitive_file | cut -d "," -f 1 | sort -u)
    for collection in $collections
    do
        fields=$(awk -F "," -v c="$collection" 'NR>1 && $1==c {print $2}' $sensitive_file)
        echo "[[script]]"
        echo "namespace = \"$db_name.$collection\""
        echo "script = \"\"\""
        echo "module.exports = function(doc) {"
        for field in $fields
        do
            echo "  delete doc[\"$field\"];"
        done
        echo "  return doc;"
        echo "}"
        echo "\"\"\""
        echo ""
    done
fi
