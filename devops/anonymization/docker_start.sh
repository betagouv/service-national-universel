#!/bin/bash

cd "$(dirname $0)"

set -o pipefail
set -e

./anonymize_db.sh $SOURCE_DATABASE_URI $TARGET_DATABASE_URI