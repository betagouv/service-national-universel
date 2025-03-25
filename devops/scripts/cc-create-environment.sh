#!/bin/bash

set -ex

if [ "$#" -lt 2 ]; then
    echo "Create test environment on CleverCloud"
    echo "Usage $0 <organization_id>"
    echo "  organization_id: CleverCloud organization ID"
    echo "  ci_application_id: CI application ID"
    exit 1
fi

org_id=$1
ci_app_id=$2

if [[ $org_id == "" ]]
then
    echo "You must specify the organization_id"
    exit 1
fi

if [[ $ci_app_id == "" ]]
then
    echo "You must specify the ci_application_id"
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

cc_endpoint=https://api.clever-cloud.com


result=$(clever applications list \
    --format json \
    --org $CC_ORG_ID \
| jq '.[0].applications[]|select(.name == $ENV_NAME)' --arg ENV_NAME "$env_name")

if [[ $result != "" ]]; then
    app_id=$(jq -r '.app_id' <<< $result)
    echo "Application $env_name already exists (id: $app_id). Aborting"
    exit 0
fi


result=$(clever create \
    --org $org_id \
    --type node \
    --github betagouv/service-national-universel \
    --region par \
    --format json \
    $env_name)

app_id=$(jq -r '.id' <<< $result)

clever config update \
    --description $env_name \
    --enable-zero-downtime \
    --enable-cancel-on-push \
    --enable-force-https

clever scale \
    --flavor S \
    --build-flavor XL

clever curl -s -X PUT "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/branch" \
    -H 'Content-Type: application/json' \
    --data-raw "{\"branch\":\"$branch_name\"}"

clever env --app $ci_app_id | sed \
    -e "s#ENVIRONMENT=\"ci\"#ENVIRONMENT=\"$env_name\"#g" \
    -e "s#ci.beta-snu.dev#$env_name.$domain#g" \
    | clever env import --app $app_id

clever domain add api.$env_name.$domain/
clever domain add api.$env_name.$domain/v2/
clever domain add admin.$env_name.$domain/
clever domain add moncompte.$env_name.$domain/
