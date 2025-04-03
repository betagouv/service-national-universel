#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "List test environment (prefixed by 'env-') on CleverCloud"
    echo "Usage $0 <organization_id>"
    echo "  organization_id: CleverCloud organization ID"
    exit 1
fi

org_id=$1

if [[ $org_id == "" ]]
then
    echo "You must specify the organization_id"
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

clever applications list --format json --org $org_id \
| jq -r '.[0].applications[] | select(.name | startswith("env-") ) | .name' \
| grep "^env-" # Just to be sure

