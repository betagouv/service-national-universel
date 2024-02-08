# What remains to do on the terraform stack

## APP & ADMIN - environment variable runtime substitution

At the moment, the runtime substitution is done via sed (cf . [docker-env.sh](../admin/docker-env.sh))

The clean way to do it, would be to use [import-meta-env](https://import-meta-env.org/guide/getting-started/runtime-transform.html)


## API & PM2

PM2 is used for api to automatically restart a node process when the previous one has crashed, and log the crash to slack.

Ideally, a docker container should only start the node process, and let the cloud provider orchestrator restart a new container when the previous one has crashed.
Alert based on the container log should the be sent on slack to report the crash.

In practice, a api container takes about 1 minute to spawn without PM2, whereas PM2 restart a process in a few seconds, so at the moment we prefer to keep PM2

Note that PM2 add about one more minute for a container to start (cf. measurements):

Possible future improvements are :

- Use the [PM2 docker integration](https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/)
- Speed up the api container boot time & run only the node process : At the moment the docker run : npm -> turbo -> pm2


### Measurements

from containers cockpit logs :

With PM2
11h08:09 -> 11h10:07 : 1min58
11h33:24 -> 11h35:08 : 1min44

Without PM2
12:11:50 -> 12:12:40 : ~50s
12:08:54 -> 12:09:31 : ~37s


## Generate a plan then apply it during deploy actions

Ideally, we should [generate a plan file](https://developer.hashicorp.com/terraform/cli/commands/plan#out-filename) during the [Plan](https://developer.hashicorp.com/terraform/cli/commands/plan) step, and use it in the [Apply](https://developer.hashicorp.com/terraform/cli/commands/apply) step, ensuring the infrastructure state hasn't changed beetween the 2 steps.

But a plan file can be a sensitive data and must be treated as [encrypted](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#storing-large-secrets) [artifact](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)

At the moment, not using plan files has not a huge impact, as deployment is only handled in github actions, and actions concurrency ensures that the same state isn't planned or applied at the same time.

## production hotfix

Step required to deploy an hotfix in production :

1. Create locally a branch **production_hotfix** from **production**
2. Cherry-pick the commit(s) that fix
3. Push the branch **production_hotfix**
4. The workflow **deploy-production-hotfix** build the docker image (It doesn't exists in CI registry), run tests, deploy stage, deploy production after a manual approval, and destroy the branch **production_hotfix**

## Docker build & Versionning

At the moment, every app are built and deploy even if there is no change on one of them.

An improvement to lower github usage costs and speed deploy would be to version each app independently, and use these versions as image_tag (build and deploy only if the image_tag has changed)

## Terraform backend

At the moment, we use a [postgres instance](https://www.scaleway.com/en/docs/faq/databases-for-postgresql-and-mysql/) only to store the terraform backend.

Possible improvements :

- use [Serverless SQL database](https://www.scaleway.com/en/docs/faq/serverless-sql-databases/) for this purpose to reduce costs but it's not available yet.
- use one separate database instance per user (production & ci). (At the moment there is only one database instance with 2 databases & related users)
- use encryption at rest for the database, but it is not yet provided by Scaleway
