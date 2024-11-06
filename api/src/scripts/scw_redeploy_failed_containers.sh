#!/bin/bash

if [ "$#" -lt 2 ]; then
    echo "Redeploy Scaleway containers on error state"
    echo "Usage $0 <project> <namespace>"
    echo "  project: Project name"
    echo "  namespace: Container namespace"
    echo "Example: $0 snu-ci snu-custom"
    exit 1
fi

project_name=$1
container_namespace=$2

if [[ $project_name == "" ]]
then
    echo "You must specify the project name"
    exit 1
fi

if [[ $container_namespace == "" ]]
then
    echo "You must specify the secret name"
    exit 1
fi

# git
if ! [[ -x "$(command -v base64)" ]]; then
  echo 'ERROR: base64 is not installed' >&2
  exit 1
fi

# jq
if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq is not installed' >&2
  exit 1
fi

# curl
if ! [[ -x "$(command -v curl)" ]]; then
  echo 'ERROR: curl is not installed' >&2
  exit 1
fi

if [[ $SCW_SECRET_KEY == "" ]]
then
    echo "SCW_SECRET_KEY is not defined"
    exit 1
fi

if [[ $SCW_ORGANIZATION_ID == "" ]]
then
    echo "SCW_ORGANIZATION_ID is not defined"
    exit 1
fi

region=fr-par


set -o pipefail

if ! project_id=$(
    curl -sX GET \
        -H "X-Auth-Token: $SCW_SECRET_KEY" \
        "https://api.scaleway.com/account/v3/projects?organization_id=$SCW_ORGANIZATION_ID&name=$project_name" \
    | jq -er '.projects[0].id'
); then
    exit 1;
fi

if ! namespace_id=$(
    curl -sX GET \
        -H "X-Auth-Token: $SCW_SECRET_KEY" \
        "https://api.scaleway.com/containers/v1beta1/regions/$region/namespaces?project_id=$project_id&name=$container_namespace" \
    | jq -r '.namespaces[0].id'
); then
    exit 1;
fi

containers_file=$(mktemp);

curl -sX GET -H "X-Auth-Token: $SCW_SECRET_KEY" \
    "https://api.scaleway.com/containers/v1beta1/regions/$region/containers?namespace_id=$namespace_id&order_by=created_at_desc&page_size=100" \
    | jq -r '.containers[]|select(.status | contains("error"))|"\(.id) \(.name)"' \
    > $containers_file

if [[ ! -s $containers_file ]]; then
    echo "No container on error state"
    exit 0
fi

while read container
do
    echo $container
    container_id=$(echo "$container" | cut -d " " -f 1)
    curl -sX POST -H "X-Auth-Token: $SCW_SECRET_KEY" -H "Content-Type: application/json" -d '{}' --output /dev/null \
        "https://api.scaleway.com/containers/v1beta1/regions/$region/containers/$container_id/deploy"
done < $containers_file
