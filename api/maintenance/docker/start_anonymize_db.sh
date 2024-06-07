#!/bin/bash

script_dir=$(dirname $0)

set -o pipefail
set -e

src_db_uri=$($script_dir/../scripts/get_secrets.sh snu-production | jq -r ".MONGO_URL")
dest_db_uri=$($script_dir/../scripts/get_secrets.sh snu-staging | jq -r ".MONGO_URL")

echo "Running anonymisation"
sleep 60
#./$script_dir/../scripts/anonymise_db.sh $src_db_uri $dest_db_uri
