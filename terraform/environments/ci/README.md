# Terraform infastructure stack - CI

This directory contains files that describe the cloud infrastructure managed by the CI environment.

The CI environment manages several resources:

- CI resources
- Test environment resources

## CI resources

All CI resources are described in [main.tf](main.tf). The most important are :

- The [project](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/account_project) that owns all resources of the ci environment
- The [application user](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/iam_application) scoped on this project
- The root [DNS zone](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/domain_zone): **ci.beta-snu.dev**
- The [registry](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/registry_namespace)
- The [secrets](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/secret)
- The [serverless containers](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/container) that serve the different applications

### CI applications

The CI applications are supposed to reflect the most recent state of the **main** branch, and can be accessed via these endpoints :

- https://api.ci.beta-snu.dev
- https://app.ci.beta-snu.dev
- https://admin.ci.beta-snu.dev

## Test environments

A test environment is supposed to reflect the state of a specific development (Most recent state of a pull request).

It is dynamically generated when a pull request is opened, and destroyed when the pull request is closed.

Every update to the PR triggers updates on the test environments.

Test environment are created by default except if the branch name of the PR follows on of these patterns:

- \*-no-ci-\*
- no-ci-\*
- \*no-ci
- equivalent with underscores

Associated github workflows :

- deploy-custom-env.yml
- destroy-custom-env.yml

### Test environments resources

All test environments resources are described in [custom/main.tf](custom/main.tf). The most important are :

- The child [DNS zone](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/domain_zone): A nested DNS zone inside **ci.beta-snu.dev**
- The [secrets](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/secret) specific to this test environment. (Copied from ci at creation)
- The [serverless containers](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/container) that serve the different applications

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

Use the script [create_project.sh](create_project.sh) to create the project and secret
