#!/bin/bash

cd "$(dirname $0)/.."

if [[ $ES_ENDPOINT == "" ]]
then
  echo "ES_ENDPOINT is not defined"
  exit 1
fi

cat <<EOF

UPSERTING INGEST PIPELINES

EOF

ls config/ingest_pipelines/*.json \
| while read filename
do
    name=$(basename $filename ".json")
    echo "Upserting pipeline $name"
    curl -w "\n" -X PUT "$ES_ENDPOINT/_ingest/pipeline/$name" -H 'Content-Type: application/json' -d @$filename
done



cat <<EOF

UPSERTING INDEX TEMPLATES

EOF

ls config/index_templates/*.json \
| while read filename
do
    name=$(basename $filename ".json")
    echo "Upserting index_template $name"
    curl -w "\n" -X PUT "$ES_ENDPOINT/_index_template/$name" -H 'Content-Type: application/json' -d @$filename
done
