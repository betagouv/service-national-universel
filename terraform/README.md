# Terraform infastructure stack

This directory contains files that describe the cloud infrastructure required to run the SNU applications.

At the moment, only infrastructure hosted on the [Scaleway](https://console.scaleway.com/) provider are described here

## Tools

- [Terraform](https://developer.hashicorp.com/terraform/docs) is the tool used to manage the cloud infrastructure
- The [Scaleway provider](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs) allows management of Scaleway ressources via Terraform

### Usage

- Setup the credentials (see below)
- [Install terraform](https://developer.hashicorp.com/terraform/install)
- From a terraform directory (ex: ./environments/ci), run the following commands:

```shell
terraform init # initializes a terraform working directory
terraform plan # show the changes that will be applied on the infrastructure
terraform apply # apply the changes on the insfrastructure
```

## Backend

Terraform stores the current state of the infrastructure in the **backend**

In the SNU case, backends are [Postgres databases](https://developer.hashicorp.com/terraform/language/settings/backends/pg) hosted in Scaleway

## Credentials

To use terraform to manage the SNU infrastructure, several access are required.

### Backend/Postgres credentials

In order to access and manage the backend state, postgres credentials are required :

```bash
export PG_CONN_STR="postgres://<host>:<port>/<db_name>"
export PGUSER="<db_user>"
read -s PGPASSWORD
export PGPASSWORD
```

### Scaleway credentials

In order to manage resource on Scaleway, access & secret key are required :

```bash
export SCW_ACCESS_KEY="<access_key>"
read -s SCW_SECRET_KEY
export SCW_SECRET_KEY
```

## Separation between Production and CI

The SNU infrastructure is divided in two separate environments, **production** and **ci**

Each environment has :

- its own backend
- its own [project](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/account_project), that owns all resources of that environment
- its own [application user](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/iam_application), with restricted [policy](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/iam_policy) [scoped](https://www.scaleway.com/en/docs/identity-and-access-management/iam/concepts/#scope) on the project

This way, the application user of the ci environment cant interfere with any of the resources of the production environment.

This separation provides a complete isolation beetween production and ci.

Each environment has its corresponding directory :

- [production](environments/production/README.md)
- [ci](environments/ci/README.md)


## HOW TO

See [HOW_TO.md](HOW_TO.md)

## TODO

See [TODO.md](TODO.md)
