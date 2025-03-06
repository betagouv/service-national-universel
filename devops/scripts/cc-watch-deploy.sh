#!/bin/bash

set -e

if [[ $ORGANIZATION_ID == "" ]]
then
    echo "You must specify the source"
    exit 1
fi

if [[ $APPLICATION_ID == "" ]]
then
    echo "You must specify the destination database URI"
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

org_id=$ORGANIZATION_ID
app_id=$APPLICATION_ID

cc_endpoint=https://api.clever-cloud.com
sha=$(git rev-parse HEAD)

echo "Waiting for deployment to start"
deployment_started=""
until [[ $deployment_started ]]; do
    deployment_started=$(clever curl -s "$cc_endpoint/v2/organisations/$org_id/applications/$app_id/deployments?action=DEPLOY&limit=1" \
        | jq '[ .[] | select(.state == "WIP" and .commit == $sha and .cause == "github") ] | .[0] // empty' --arg sha "$sha")
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
