#!/bin/bash

cd "$(dirname $0)/../scripts"

set -o pipefail
set -e

src_db_uri=$(./get_secrets.sh snu-production | jq -r ".MONGO_URL")
dest_db_uri=$(./get_secrets.sh snu-staging | jq -r ".MONGO_URL")

./anonymize_db.sh $src_db_uri $dest_db_uri
