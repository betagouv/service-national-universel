#!/bin/bash

cd "$(dirname $0)/.."

set -o pipefail
set -e

if [ "$#" -lt 1 ]; then
    echo "Usage $0 <centre|cle|useful|all>"
    exit 1
fi

npx -y ts-node ../reindex_es_all_models/index.js $1
