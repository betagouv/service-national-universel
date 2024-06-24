#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Get secret by name"
    echo "Usage $0 <secret> [<revision>]"
    echo "  secret: Secret name"
    echo "  revision: Revision (default: latest_enabled)"
    exit 1
fi

secret_name=$1
revision=$2

if [[ $secret_name == "" ]]
then
    echo "You must specify the secret name"
    exit 1
fi

if [[ $revision == "" ]]
then
    revision="latest_enabled"
fi

# base64
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

if [[ $SCW_PROJECT_ID == "" ]]
then
    echo "SCW_PROJECT_ID is not defined"
    exit 1
fi

region=fr-par

set -o pipefail

curl -sX GET \
    -H "X-Auth-Token: $SCW_SECRET_KEY" \
    "https://api.scaleway.com/secret-manager/v1beta1/regions/$region/secrets-by-path/versions/$revision/access?project_id=$SCW_PROJECT_ID&secret_name=$secret_name" \
| jq -er '.data' \
| base64 -d \
| jq
