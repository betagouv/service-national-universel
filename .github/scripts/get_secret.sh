#!/bin/bash

if [ "$#" -lt 2 ]; then
    echo "Get secret by name"
    echo "Usage $0 <project> <secret> [<revision>]"
    echo "  project: Project name"
    echo "  secret: Secret name"
    echo "  revision: Revision (default: latest_enabled)"
    exit 1
fi

project_name=$1
secret_name=$2
revision=$3

if [[ $project_name == "" ]]
then
    echo "You must specify the project name"
    exit 1
fi

if [[ $secret_name == "" ]]
then
    echo "You must specify the secret name"
    exit 1
fi

if [[ $revision == "" ]]
then
    revision="latest_enabled"
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

if [[ $SCW_REGION == "" ]]
then
    echo "SCW_ORGANIZATION_ID is not defined"
    exit 1
fi

set -o pipefail

if ! project_id=$(
    curl -sX GET \
        -H "X-Auth-Token: $SCW_SECRET_KEY" \
        "https://api.scaleway.com/account/v3/projects?organization_id=$SCW_ORGANIZATION_ID&name=$project_name" \
    | jq -er '.projects[0].id'
); then
    exit 1;
fi

curl -sX GET \
    -H "X-Auth-Token: $SCW_SECRET_KEY" \
    "https://api.scaleway.com/secret-manager/v1beta1/regions/$SCW_REGION/secrets-by-path/versions/$revision/access?project_id=$project_id&secret_name=$secret_name" \
| jq -er '.data' \
| base64 --decode \
| jq
