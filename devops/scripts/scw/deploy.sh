#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Deploy Scaleway Container"
    echo "Usage $0 <scw_container_id>"
    echo "  scw_container_id: Scaleway container ID"
    exit 1
fi

container_id=$1

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

scw_endpoint=https://api.scaleway.com

curl --silent -X POST \
  -H "X-Auth-Token: $SCW_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$scw_endpoint/containers/v1beta1/regions/fr-par/containers/$container_id/deploy"
