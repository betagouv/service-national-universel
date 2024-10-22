#!/bin/bash

# secrets.json format example :
# {
# "MY_SECRET":"<my_secret_value>",
# "MY_OTHER_SECRET":"<my_other_secret_value>"
# }

# requirements
# jq
if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq is not installed' >&2
  exit 1
fi

# curl
if ! [[ -x "$(command -v curl)" ]]; then
  echo 'ERROR: curl is not installed' >&2
  exit 1
fi

if [[ $SCW_SECRET_KEY == "" ]]
then
    echo "SCW_SECRET_KEY is not specified in environment"
    exit 1
fi

set -e

secret_file="secrets.json"
organization_id="<scaleway_organisation_id>"
region="fr-par"
project_name="snu-ci"

headers_file=".headers"
data_file="body.json"

cat > $headers_file <<EOF
X-Auth-Token: $SCW_SECRET_KEY
Content-Type: application/json
EOF


total_count=$(curl -s -X GET -H@$headers_file "https://api.scaleway.com/account/v2/projects?organization_id=$organization_id&name=$project_name" | jq -r ".total_count")
if [[ $total_count != "0" ]]
then
    echo "Project $project_name already exists"
    exit 0
fi

# CREATE PROJECT
cat > $data_file <<EOF
{
  "name": "$project_name",
  "organization_id": "$organization_id"
}
EOF
project_id=$(curl -s -X POST -H@$headers_file --data @$data_file "https://api.scaleway.com/account/v2/projects" | jq -r ".id")
echo "Project ID: $project_id"


# CREATE SECRETS
for environment in "ci"; do

cat > $data_file <<EOF
{
  "name": "snu-$environment",
  "project_id": "$project_id"
}
EOF
secret_id=$(curl -s -X POST -H@$headers_file --data @$data_file "https://api.scaleway.com/secret-manager/v1alpha1/regions/$region/secrets" | jq -r ".id")
echo "Secret ID ($environment): $secret_id"


data=$(base64 -i $secret_file)
cat > $data_file <<EOF
{
  "data": "$data"
}
EOF
curl -s -X POST -H@$headers_file --data @$data_file "https://api.scaleway.com/secret-manager/v1alpha1/regions/$region/secrets/$secret_id/versions"

done

rm $data_file $headers_file
