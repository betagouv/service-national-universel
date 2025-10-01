#!/bin/bash

set -e

if [ "$#" -lt 4 ]; then
    echo "Create test environment on CleverCloud"
    echo "Usage $0 <organization_id>"
    echo "  organization_id: CleverCloud organization ID"
    echo "  ci_application_id: CI application ID"
    echo "  branch_name: Branch name"
    echo "  sha: Commit sha"
    exit 1
fi

org_id=$1
ci_app_id=$2
branch_name=$3
sha=$4

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

if [[ $branch_name == "" ]]
then
    echo "You must specify the branch_name"
    exit 1
fi

if [[ $sha == "" ]]
then
    echo "You must specify the commit sha"
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

directory=$(dirname $0)

echo "branch_name: $branch_name"
env_name=$($directory/cc-environment-name.sh $branch_name)
echo "env_name: $env_name"

domain=ci.beta-snu.dev

cc_endpoint=https://api.clever-cloud.com


result=$(clever applications list \
    --format json \
    --org $org_id \
| jq '.[0].applications[]|select(.name == $ENV_NAME)' --arg ENV_NAME "$env_name"
)

if [[ $result != "" ]]; then
    app_id=$(jq -r '.app_id' <<< $result)
    echo "Application $env_name already exists (id: $app_id)"
else # Create application
    if [[ -f .clever.json ]]; then
        echo ".clever.json file already exists. Aborting"
        exit 1
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
        -e "s#SUPPORT_URL=\"[^\"]*\"#SUPPORT_URL=\"https://api-support.ci.beta-snu.dev\"#g" \
        | clever env import --app $app_id

    clever domain add api.$env_name.$domain/
    clever domain add api.$env_name.$domain/v2/
    clever domain add admin.$env_name.$domain/
    clever domain add moncompte.$env_name.$domain/
    clever domain add tasks.$env_name.$domain/
    clever domain add tasksv2.$env_name.$domain/
fi

deployment_started=$(clever curl -s "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/deployments?action=DEPLOY&limit=1" \
        | jq '[ .[] | select(.state == "WIP" and .commit == $sha) ] | .[0] // empty' --arg sha "$sha")
if [[ $deployment_started == "" ]]; then
    echo "Start deployment"
    clever curl -s -X POST "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/instances"
fi

$directory/cc-watch-deploy.sh $org_id $app_id $sha
