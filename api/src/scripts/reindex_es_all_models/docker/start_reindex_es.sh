#!/bin/bash

cd "$(dirname $0)/.."

set -o pipefail
set -e

if [[ -z $GROUP_NAME || $GROUP_NAME == "none" ]]; then
    echo "Usage $0 <centre|cle|useful|all>"
    exit 1
fi

ls

node ./index.js $GROUP_NAME
