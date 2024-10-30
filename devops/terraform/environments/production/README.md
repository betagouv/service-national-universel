# Terraform infastructure stack - production

This directory contains files that describe the cloud infrastructure managed by the production environment.

The production environment manages several resources:

- Common resources
- production resources
- staging resources

## Common resources

All Common resources are described in [main.tf](main.tf). The most important are :

- The [project](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/account_project) that owns all resources of the ci environment
- The [application user](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/iam_application) scoped on this project
- The [registry](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/registry_namespace)

## Production resources

All production resources are described in [production.tf](production.tf). The most important are :

- The [secrets](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/secret)
- The [serverless containers](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/container) that serve the different applications

## Staging resources

All staging resources are described in [staging/main.tf](staging/main.tf). The most important are :

- The [secrets](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/secret)
- The [serverless containers](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/container) that serve the different applications

The staging environment has its own terraform state, separated from the state of production (different **schema_name** in the Postgres backend), to allow staging apps to be deployed separatly from production apps.

## Applications endpoints

The production applications are supposed to reflect the most recent state of the **production** branch, and can be accessed via these endpoints :

Production :

- https://api.snu.gouv.fr
- https://admin.snu.gouv.fr
- https://moncompte.snu.gouv.fr

Staging :

- https://api.beta-snu.dev
- https://admin.beta-snu.dev
- https://moncompte.beta-snu.dev


## Bootstrap Production

The Production stack has two pre-requisites, before it can ben deployed the first time :

- The Production project must exists
- The Production secrets must exists inside the production project
- The Staging secrets must exists inside the production project

The corresponding **project_id** and **secret_ids**, must be specified in [imports.tf](imports.tf)

The first deploy will then import the project and secret into the CI stack.

### Boostrap script

Given **secrets.json** defined as :

```json
{
"MY_SECRET":"<my_secret_value>",
"MY_OTHER_SECRET":"<my_other_secret_value>"
}
```

This script creates a project and a secret :

```shell
#!/bin/bash

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

organization_id="<scaleway_organisation_id>"
region="fr-par"
project_name="snu-production"

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
for environment in "production" "staging"; do

secret_file="$environment-secrets.json"

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
```
