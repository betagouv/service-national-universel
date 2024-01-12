# HOW TO

## Deploy in ci

The [deploy-ci](../.github/workflows/deploy-ci.yml) workflow is triggered at each commit on main, and can also be [triggered manually](https://github.com/betagouv/service-national-universel/actions/workflows/deploy-ci.yml)

It builds docker images and deploy only if the unit test are successfull.

## Create a custom environment

The [deploy-custom-env](../.github/workflows/deploy-custom-env.yml) workflow is triggered when a pull request is opened or modified if the corresponding branch name contains **ci-\***, **\*-ci**, or **\*-ci-\***
It can also be [triggered manually](https://github.com/betagouv/service-national-universel/actions/workflows/deploy-custom-env.yml), but you will have to retrigger manually on every new commit if you choose this way.

The environment urls are provided in a PR comment, when the environment is created

The [destroy-custom-env](../.github/workflows/destroy-custom-env.yml) workflow is triggered when a pull request is closed, or can also be [triggered manually](https://github.com/betagouv/service-national-universel/actions/workflows/destroy-custom-env.yml)

## Deploy in production

The [deploy-production](../.github/workflows/deploy-production.yml) workflow is triggered when the branch **release_candidate** is created from **main**.

It doesn't build docker images, but instead reuses images built in CI.

Production deployment is performed only if staging deployment is successfull.

Production deployment needs manual approval before deploying in prod (accessible from a slack notification). The terraform plan is viewable at the **plan_production** step.

When the deployment is successfull, the branch **release_candidate** is merged (--ff-only) in **production** then destroyed


## Rollback to previous tag in production

Locally, with proper [credentials](README.md) set up :

Get the **image_tag** you want to rollback to. This tag must be present in the production [registry](https://console.scaleway.com/registry/namespaces/fr-par/15d7461d-a478-4c89-a655-dfb6f67a54b1/images) (rg.fr-par.scw.cloud/snu-production)

```shell
cd terraform/environments/production
terraform init # only needed once
image_tag="my_image_tag"
terraform plan -var="image_tag=$image_tag"
terraform apply -var="image_tag=$image_tag"
```

## Manually clean a custom environment in a stale state

Locally, with proper [credentials](README.md) set up :

```shell
cd terraform/environments/ci
cp -R custom tmp
cd tmp
environment_name="my_environment_name"
sed -I".bak" "s|###___ENV_NAME___###|$environment_name|g" main.tf
terraform init
# Use as many "terraform state rm" as needed
terraform destroy -var="image_tag=latest"
cd ..
rm -Rf tmp
```

Wait, **terraform state rm** ???

Sometimes, you may have this kind of error at the plan/apply step :

```
│ Error: no zone found with the name feat-1570.ci.beta-snu.dev
│
│   with scaleway_domain_zone.main,
│   on main.tf line 44, in resource "scaleway_domain_zone" "main":
│   44: resource "scaleway_domain_zone" "main" {
│
```

It means that a ressource is present in the terraform state, but doesn't exists anymore (for example this ressource has been manually deleted outside of terraform).

You can remove this ressource from the [terraform state](https://developer.hashicorp.com/terraform/cli/commands/state) :

```shell
terraform state rm scaleway_domain_zone.main
```
