#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Create test environment on CleverCloud"
    echo "Usage $0 <cc_organization_id>"
    echo "  cc_organization_id: CleverCloud organization ID"
    exit 1
fi

org_id=$1

if [[ $org_id == "" ]]
then
    echo "You must specify the cc_organization_id"
    exit 1
fi

if ! [[ -x "$(command -v clever)" ]]; then
  echo 'ERROR: clever-tools are not installed : https://github.com/CleverCloud/clever-tools/blob/master/docs/setup-systems.md' >&2
  exit 1
fi

if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq not installed install : brew install jq' >&2
  exit 1
fi

if [[ -f .clever.json ]]; then
    echo ".clever.json file already exists. Aborting"
    exit 1
fi

branch_name=$(git rev-parse --abbrev-ref HEAD)
echo "branch_name: $branch_name"
env_name=$($(dirname $0)/cc-environment-name.sh $branch_name)
echo "env_name: $env_name"

domain=poc.ci.beta-snu.dev


result=$(clever applications list \
    --format json \
    --org $CC_ORG_ID \
| jq '.[0].applications[]|select(.name == $ENV_NAME)' --arg ENV_NAME "$env_name")

if [[ $result != "" ]]; then
    app_id=$(jq -r '.app_id' <<< $result)
    echo "Application $env_name already exists (id: $app_id). Aborting"
    exit 0
fi


clever create \
    --org $org_id \
    --type node \
    --github betagouv/service-national-universel \
    --region par \
    --format json \
    $env_name

clever config update \
    --description $env_name \
    --enable-zero-downtime \
    --enable-cancel-on-push \
    --enable-force-https

clever scale \
    --flavor S \
    --build-flavor XL

clever domain add api.$env_name.$domain/
clever domain add api.$env_name.$domain/v2/
clever domain add admin.$env_name.$domain/
clever domain add moncompte.$env_name.$domain/
