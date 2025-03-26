#!/bin/bash

set -e

if [ "$#" -lt 3 ]; then
    echo "Create test environment on CleverCloud"
    echo "Usage $0 <organization_id>"
    echo "  organization_id: CleverCloud organization ID"
    echo "  application_id: CleverCloud application ID"
    echo "  sha: Commit sha"
    exit 1
fi

org_id=$1
app_id=$2
sha=$3

if [[ $org_id == "" ]]
then
    echo "You must specify the organization_id"
    exit 1
fi

if [[ $app_id == "" ]]
then
    echo "You must specify the app_id"
    exit 1
fi

if [[ $sha == "" ]]
then
    echo "You must specify the sha"
    exit 1
fi

if ! [[ -x "$(command -v clever)" ]]; then
  echo 'ERROR: clever-tools are not installed : https://github.com/CleverCloud/clever-tools/blob/master/docs/setup-systems.md' >&2
  exit 1
fi

if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq is not installed' >&2
  exit 1
fi

cc_endpoint=https://api.clever-cloud.com

echo "Waiting for deployment to start"
deployment_started=""
until [[ $deployment_started ]]; do
    deployment_started=$(clever curl -s "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/deployments?action=DEPLOY&limit=1" \
        | jq '[ .[] | select(.state == "WIP" and .commit == $sha) ] | .[0] // empty' --arg sha "$sha")
    sleep 5
done

deployment_id=$(jq -r '.uuid' <<< $deployment_started)
echo "Deployment $deployment_id started : https://console.clever-cloud.com/organisations/$org_id/applications/$app_id/logs?deploymentId=$deployment_id"

deployment_ended=""
until [[ $deployment_ended ]]; do
    deployment_ended=$(clever curl -s "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/deployments/$deployment_id" \
        | jq '. | select(.state != "WIP" and .uuid == $uuid)' --arg uuid "$deployment_id")
    sleep 10
done

deployment_state=$(jq -r '.state' <<< $deployment_ended)
echo "Deployment $deployment_id ended with state $deployment_state"

if [[ $deployment_state != "OK" ]]; then
    # PRINT LOGS
    # while read -t 10 row; do
    #     echo $row
    # done < <(clever logs --deployment-id $deployment_id --since 1h)
    exit 1;
fi
