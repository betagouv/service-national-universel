# Terraform infastructure stack - CI

This directory contains files that describe the cloud infrastructure managed by the CI environment.

The CI environment manages several resources:

- CI resources
- Test environment resources

## CI resources

All CI resources are described in [main.tf](main.tf). The most important are :

- The [project](https://www.scaleway.com/en/docs/identity-and-access-management/iam/concepts/#project) that owns all resources of the ci environment
- The [application user](https://www.scaleway.com/en/docs/identity-and-access-management/iam/concepts/#application) scoped on this project
- The root [DNS zone](https://www.scaleway.com/en/docs/network/domains-and-dns/concepts/#dns-zone): **ci.beta-snu.dev**
- The [registry](https://www.scaleway.com/en/docs/containers/container-registry/concepts/#container-registry)
- The [secrets](https://www.scaleway.com/en/docs/identity-and-access-management/secret-manager/concepts/)
- The [serverless containers](https://www.scaleway.com/en/docs/serverless/containers/concepts/#container) that serve the different applications

### CI applications

The CI applications are supposed to reflect the most recent state of the **main** branch, and can be accessed via these endpoints :

- https://api.ci.beta-snu.dev
- https://app.ci.beta-snu.dev
- https://admin.ci.beta-snu.dev


## Test environments

A test environment is supposed to reflect the state of a specific development (Most recent state of a pull request).

It is dynamically generated when a pull request is open, and destroyed when the pull request is closed.

Every update to the PR, triggers updates on the test environments.

Test environment are created only if the branch name of the PR includes on of these patterns:

- *-ci-*
- ci-*
- *-ci

Associated github workflows :

- deploy-custom-env.yml
- destroy-custom-env.yml

### Test environments resources

All test environments resources are described in [custom/main.tf](custom/main.tf). The most important are :

- The child [DNS zone](https://www.scaleway.com/en/docs/network/domains-and-dns/concepts/#dns-zone): A nested DNS zone inside **ci.beta-snu.dev**
- The [secrets](https://www.scaleway.com/en/docs/identity-and-access-management/secret-manager/concepts/) specific to this test environment. (Copied from ci at creation)
- The [serverless containers](https://www.scaleway.com/en/docs/serverless/containers/concepts/#container) that serve the different applications

Test environments have their own DNS zone inside the CI DNS zone. The name varies depending on the branch name.

For example, if the branch name is **feat-1234-ci**, the applications can be accessed via these endpoints :

- https://api.feat-1234-ci.ci.beta-snu.dev
- https://app.feat-1234-ci.ci.beta-snu.dev
- https://admin.feat-1234-ci.ci.beta-snu.dev

### Test environments backend

Each test environment has its own terraform state, separated from the state of CI. (different **schema_name** in the Postgres backend)


## Bootstrap CI

The CI stack has two pre-requisites, before it can ben deployed the first time :

- The CI project must exists
- The CI secrets must exists inside the CI project

The corresponding **project_id** and **secret_id**, must be specified in [imports.tf](imports.tf)

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
```
