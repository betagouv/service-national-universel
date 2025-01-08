#!/bin/bash

cd "$(dirname $0)"

set -o pipefail
set -e


node -e 'require("bson"); require("uuid")'
node -e 'require("../../api/src/anonymization/young.js")'
# ./anonymize_db.sh $SOURCE_DATABASE_URI $TARGET_DATABASE_URI