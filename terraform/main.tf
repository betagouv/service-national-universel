# secrets

variable "sentry_auth_token" {
  type     = string
  nullable = false
}

variable "userback_access_token" {
  type     = string
  nullable = false
}

variable "analytics_api_key" {
  type     = string
  nullable = false
}

variable "aws_secret_access_key" {
  type     = string
  nullable = false
}

variable "association_cellar_keysecret" {
  type     = string
  nullable = false
}

variable "cellar_keysecret" {
  type     = string
  nullable = false
}

variable "cellar_keysecret_support" {
  type     = string
  nullable = false
}

variable "file_encryption_secret" {
  type     = string
  nullable = false
}

variable "file_encryption_secret_support" {
  type     = string
  nullable = false
}

variable "france_connect_client_secret" {
  type     = string
  nullable = false
}

variable "api_secret" {
  type     = string
  nullable = false
}

variable "send_in_blue_key" {
  type     = string
  nullable = false
}

variable "token_load_test" {
  type     = string
  nullable = false
}

variable "zammad_token" {
  type     = string
  nullable = false
}

variable "mongo_url" {
  type     = string
  nullable = false
}

variable "jva_token" {
  type     = string
  nullable = false
}

variable "diagoriente_token" {
  type     = string
  nullable = false
}

variable "pm2_slack_url" {
  type     = string
  nullable = false
}

# config

variable "api_domain" {
  type     = string
  nullable = false
}

variable "admin_domain" {
  type     = string
  nullable = false
}

variable "app_domain" {
  type     = string
  nullable = false
}


terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

# Project
resource scaleway_account_project snu {
  name = "service-national-universel"
  description = "Test environment for snu infra"
}

# Logs
resource "scaleway_cockpit" "main" {
    project_id = scaleway_account_project.snu.id
}

resource "scaleway_cockpit_grafana_user" "main" {
  project_id = scaleway_cockpit.main.project_id
  login      = "test"
  role       = "editor"
}


# registry_ns_id=$(scw container namespace list name=snu-test -o json | jq -r ".[0].id")
# registry_endpoint=$(scw container namespace get $registry_ns_id -o json | jq -r ".registry_endpoint")
# registry_endpoint=$(terraform output -raw registry_endpoint)
# docker login $registry_endpoint -u nologin -p $SCW_SECRET_KEY
# echo $SCW_SECRET_KEY | docker login $registry_endpoint -u nologin --password-stdin
# docker build -t $registry_endpoint/api:latest -t $registry_endpoint/api:$(git rev-parse --verify HEAD | cut -c 1-7) -f api/Dockerfile .
# docker push --all-tags $registry_endpoint/api

# Container namespace
resource scaleway_container_namespace test {
  project_id = scaleway_account_project.snu.id
  name        = "snu-test"
  description = "SNU container namespace for test environment"
}

# terraform output -raw registry_endpoint
output "registry_endpoint" {
  value = scaleway_container_namespace.test.registry_endpoint
}

resource scaleway_container test_api {
    name = "test-api"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/api:latest"
    port = 8080
    cpu_limit = 1120
    memory_limit = 1024
    min_scale = 1
    max_scale = 1
    timeout = 60
    max_concurrency = 80
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
        "ADMIN_URL" = "https://${var.admin_domain}"
        "API_ANALYTICS_ENDPOINT" = "https://app-3da9a603-eb67-4907-b545-ea40f3ffb7e0.cleverapps.io"
        "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = "AKIAR4ZAM5QBDHAG5NNW"
        "API_ASSOCIATION_CELLAR_ENDPOINT" = "cellar-c2.services.clever-cloud.com"
        "API_ASSOCIATION_CELLAR_KEYID" = "F7U1OXBT3Q2FQWXB3BAE"
        "API_ASSOCIATION_ES_ENDPOINT" = "unBpM6S9qVkQgfKVd6oZ:zRs3saRkQtY8NUhAYlkz@brs12j6ckwkl3ivnw4u4-elasticsearch.services.clever-cloud.com"
        "API_PDF_ENDPOINT" = "https://pdf.beta-snu.dev/render"
        "APP_NAME" = "api"
        "APP_URL" = "https://${var.app_domain}"
        "BUCKET_NAME" = "cni-bucket-staging"
        "CC_CLAMAV" = "true"
        "CELLAR_ENDPOINT" = "cellar-c2.services.clever-cloud.com"
        "CELLAR_ENDPOINT_SUPPORT" = "cellar-c2.services.clever-cloud.com"
        "CELLAR_KEYID" = "7XBDN3B9Z9RBMZGXWIXQ"
        "CELLAR_KEYID_SUPPORT" = "79W03BFPUMK6P9L4QT9D"
        "DIAGORIENTE_URL" = "https://api-ql-dev.projetttv.org/graphql"
        "ES_ENDPOINT" = "vPV6iDOFlosg1i7wV59MFagcGZtvWEUt:TonO1QmF1ZK1L0VRNNu1Y1O9NLOESnHL@bvujrzvlgvfiyxvim7cx-elasticsearch.services.clever-cloud.com"
        "FRANCE_CONNECT_CLIENT_ID" = "cde8fb49b9c9f0e271d572d5d4f777b8837b88ccf1660c1bae3b622dd71a97be"
        "FRANCE_CONNECT_URL" = "https://fcp.integ01.dev-franceconnect.fr/api/v1"
        "KNOWLEDGEBASE_URL" = "https://support.beta-snu.dev"
        "PUBLIC_BUCKET_NAME" = "snu-bucket-staging"
        "PUBLIC_BUCKET_NAME_SUPPORT" = "files_staging"
        "SENTRY_PROFILE_SAMPLE_RATE" = "0.8"
        "SENTRY_TRACING_SAMPLE_RATE" = "0.1"
        "SENTRY_URL" = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14"
        "STAGING" = "true"
        "SUPPORT_APIKEY" = "2f017298-5333-466b-9673-bc3b8c6a49b4"
        "SUPPORT_URL" = "https://app-923a364e-4cf7-439f-a6f0-b519d4244545.cleverapps.io"
    }

    secret_environment_variables = {
      "API_ANALYTICS_API_KEY" = var.analytics_api_key
      "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = var.aws_secret_access_key
      "API_ASSOCIATION_CELLAR_KEYSECRET" = var.association_cellar_keysecret
      "CELLAR_KEYSECRET" = var.cellar_keysecret
      "CELLAR_KEYSECRET_SUPPORT" = var.cellar_keysecret_support
      "DIAGORIENTE_TOKEN" = var.diagoriente_token
      "FILE_ENCRYPTION_SECRET" = var.file_encryption_secret
      "FILE_ENCRYPTION_SECRET_SUPPORT" = var.file_encryption_secret_support
      "FRANCE_CONNECT_CLIENT_SECRET" = var.france_connect_client_secret
      "JVA_TOKEN" = var.jva_token
      "MONGO_URL" = var.mongo_url
      "SECRET" = var.api_secret
      "SENDINBLUEKEY" = var.send_in_blue_key
      "PM2_SLACK_URL" = var.pm2_slack_url
      "TOKENLOADTEST" = var.token_load_test
      "ZAMMAD_TOKEN" = var.zammad_token
    }
}

resource scaleway_container_domain api {
  container_id = scaleway_container.test_api.id
  hostname = var.api_domain
}

resource scaleway_container test_admin {
    name = "test-admin"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/admin:latest"
    port = 8080
    cpu_limit = 1120
    memory_limit = 1024
    min_scale = 1
    max_scale = 1
    timeout = 60
    max_concurrency = 80
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
        "APP_NAME" = "admin"
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${var.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${var.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${var.app_domain}"
        "DOCKER_ENV_VITE_MAINTENANCE" = "false"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14"
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = var.userback_access_token
      "SENTRY_AUTH_TOKEN" = var.sentry_auth_token
    }
}

resource scaleway_container_domain admin {
  container_id = scaleway_container.test_admin.id
  hostname = var.admin_domain
}

resource scaleway_container test_app {
    name = "test-app"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/app:latest"
    port = 8080
    cpu_limit = 1120
    memory_limit = 1024
    min_scale = 1
    max_scale = 1
    timeout = 60
    max_concurrency = 80
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
        "APP_NAME" = "app"
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${var.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${var.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${var.app_domain}"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14"
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "FOLDER_APP" = "app"
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = var.sentry_auth_token
    }
}

resource scaleway_container_domain app {
  container_id = scaleway_container.test_app.id
  hostname = var.app_domain
}


/*
resource "scaleway_domain_zone" "test" {
  project_id = scaleway_account_project.snu.id
  domain    = "beta-snu.dev"
  subdomain = "test-api"
}

resource scaleway_domain_record test_api {
  dns_zone = "beta-snu.dev"
  name     = "test-api"
  type     = "CNAME"
  data     = "${scaleway_container.test_api.domain_name}." // Trailing dot is important in CNAME
  ttl      = 3600
}

resource scaleway_container_domain test_api {
  container_id = scaleway_container.test_api.id
  hostname = "${scaleway_domain_record.test_api.name}.${scaleway_domain_record.test_api.dns_zone}"
}
*/
