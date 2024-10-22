#!/bin/bash

cd "$(dirname $0)/.."

if [[ $ES_ENDPOINT == "" ]]
then
  echo "ES_ENDPOINT is not defined"
  exit 1
fi


cat <<EOF

DELETING INDEX TEMPLATES

EOF

ls config/index_templates/*.json \
| while read filename
do
    name=$(basename $filename ".json")
    echo "Deleting index_template $name"
    curl -w "\n" -X DELETE "$ES_ENDPOINT/_index_template/$name"
done


cat <<EOF

DELETING INDEXES

EOF

cat config/index_whitelist.txt \
| while read name
do
    echo "Deleting index $name"
    curl -w "\n" -X DELETE "$ES_ENDPOINT/$name"
done


cat <<EOF

DELETING INGEST PIPELINES

EOF

ls config/ingest_pipelines/*.json \
| while read filename
do
    name=$(basename $filename ".json")
    echo "Deleting pipeline $name"
    curl -w "\n" -X DELETE "$ES_ENDPOINT/_ingest/pipeline/$name"
done
