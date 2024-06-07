#!/bin/bash

script_dir="$(dirname $0)/../scripts"

set -o pipefail
set -e

src_db_uri=$($script_dir/get_secrets.sh snu-production | jq -r ".MONGO_URL")
dest_db_uri=$($script_dir/get_secrets.sh snu-staging | jq -r ".MONGO_URL")

$script_dir/anonymize_db.sh $src_db_uri $dest_db_uri
