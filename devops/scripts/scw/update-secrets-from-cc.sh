#!/bin/bash

set -e

if [ "$#" -lt 2 ]; then
    echo "Update Scaleway secrets from CleverCloud environment"
    echo "Usage $0 <cc_application_id> <scw_container_id>"
    echo "  cc_application_id: CleverCloud application ID"
    echo "  scw_container_id: Scaleway container ID"
    exit 1
fi

app_id=$1
container_id=$2

if [[ $app_id == "" ]]
then
    echo "You must specify the cc_application_id"
    exit 1
fi

if [[ $container_id == "" ]]
then
    echo "You must specify the scw_container_id"
    exit 1
fi

if [[ $SCW_SECRET_KEY == "" ]]
then
    echo "You must specify the SCW_SECRET_KEY"
    exit 1
fi

data=$($(dirname $0)/get-secrets-from-cc.sh $app_id \
  | sed 's/^\(.*\)="\(.*\)"$/{"key": "\1", "value": "\2"}/g' \
  | tr "\n" "," \
  | sed 's/,$//g')

scw_endpoint=https://api.scaleway.com

curl --silent -X PATCH \
  -H "X-Auth-Token: $SCW_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"secret_environment_variables\": [$data]}" \
  "$scw_endpoint/containers/v1beta1/regions/fr-par/containers/$container_id" > /dev/null