#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Get secrets from CleverCloud environment"
    echo "Usage $0 <cc_application_id>"
    echo "  cc_application_id: CleverCloud application ID"
    exit 1
fi

app_id=$1

if [[ $app_id == "" ]]
then
    echo "You must specify the cc_application_id"
    exit 1
fi


if ! [[ -x "$(command -v clever)" ]]; then
  echo 'ERROR: clever-tools are not installed : https://github.com/CleverCloud/clever-tools/blob/master/docs/setup-systems.md' >&2
  exit 1
fi

clever env --app $app_id --format human \
  | grep -v -e '^#' -e '^CC_'
