

variable "api_subdomain" {
  type     = string
  nullable = false
}

variable "api_app_name" {
  type     = string
  nullable = false
}

variable "admin_subdomain" {
  type     = string
  nullable = false
}

variable "admin_app_name" {
  type     = string
  nullable = false
}

variable "app_subdomain" {
  type     = string
  nullable = false
}

variable "app_app_name" {
  type     = string
  nullable = false
}

variable "dns_zone" {
  type     = string
  nullable = false
}

variable "environment" {
  type     = string
  nullable = false
}

variable "image_tag" {
  type     = string
  nullable = false
}

locals {
  app_domain = "${var.app_subdomain}.${var.dns_zone}"
  api_domain = "${var.api_subdomain}.${var.dns_zone}"
  admin_domain = "${var.admin_subdomain}.${var.dns_zone}"
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


# secrets
# scw secret secret create name=env-test description="Secrets for test environment"
# scw secret version create secret-id="secret-id" data="@/path/to/file"
# scw secret version access secret-id="secret-id" revision=1 -o json | jq -r ".data" | base64 -Dd

data "scaleway_secret_version" "data_by_secret_name" {
  secret_name = "env-${var.environment}"
  revision    = "1"
}

locals {
  secrets = jsondecode(base64decode(data.scaleway_secret_version.data_by_secret_name.data))
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
  name        = "snu-${var.environment}"
  description = "SNU container namespace for test environment"
}

# terraform output -raw registry_endpoint
output "registry_endpoint" {
  value = scaleway_container_namespace.test.registry_endpoint
}

resource scaleway_container test_api {
    name = "${var.environment}-${var.api_app_name}"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/${var.api_app_name}:${var.image_tag}"
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
      "ADMIN_URL" = "https://${local.admin_domain}"
      "APP_URL" = "https://${local.app_domain}"
      "APP_NAME" = var.api_app_name
      "STAGING" = "true"
      "API_ANALYTICS_ENDPOINT" = local.secrets.API_ANALYTICS_ENDPOINT
      "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
      "API_ASSOCIATION_CELLAR_ENDPOINT" = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
      "API_ASSOCIATION_CELLAR_KEYID" = local.secrets.API_ASSOCIATION_CELLAR_KEYID
      "API_ASSOCIATION_ES_ENDPOINT" = local.secrets.API_ASSOCIATION_ES_ENDPOINT
      "API_PDF_ENDPOINT" = local.secrets.API_PDF_ENDPOINT
      "BUCKET_NAME" = local.secrets.BUCKET_NAME
      "CC_CLAMAV":"true",
      "CELLAR_ENDPOINT" = local.secrets.CELLAR_ENDPOINT
      "CELLAR_ENDPOINT_SUPPORT" = local.secrets.CELLAR_ENDPOINT_SUPPORT
      "CELLAR_KEYID" = local.secrets.CELLAR_KEYID
      "CELLAR_KEYID_SUPPORT" = local.secrets.CELLAR_KEYID_SUPPORT
      "DIAGORIENTE_URL" = local.secrets.DIAGORIENTE_URL
      "FRANCE_CONNECT_CLIENT_ID" = local.secrets.FRANCE_CONNECT_CLIENT_ID
      "FRANCE_CONNECT_URL" = local.secrets.FRANCE_CONNECT_URL
      "KNOWLEDGEBASE_URL" = local.secrets.KNOWLEDGEBASE_URL
      "PUBLIC_BUCKET_NAME" = local.secrets.PUBLIC_BUCKET_NAME
      "PUBLIC_BUCKET_NAME_SUPPORT" = local.secrets.PUBLIC_BUCKET_NAME_SUPPORT
      "SENTRY_PROFILE_SAMPLE_RATE":"0.8",
      "SENTRY_TRACING_SAMPLE_RATE":"0.1",
      "SENTRY_URL" = local.secrets.SENTRY_URL
      "SUPPORT_APIKEY" = local.secrets.SUPPORT_APIKEY
      "SUPPORT_URL" = local.secrets.SUPPORT_URL
    }

    secret_environment_variables = {
      "API_ANALYTICS_API_KEY" = local.secrets.API_ANALYTICS_API_KEY
      "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
      "API_ASSOCIATION_CELLAR_KEYSECRET" = local.secrets.API_ASSOCIATION_CELLAR_KEYSECRET
      "CELLAR_KEYSECRET" = local.secrets.CELLAR_KEYSECRET
      "CELLAR_KEYSECRET_SUPPORT" = local.secrets.CELLAR_KEYSECRET_SUPPORT
      "DIAGORIENTE_TOKEN" = local.secrets.DIAGORIENTE_TOKEN
      "ES_ENDPOINT" = local.secrets.ES_ENDPOINT
      "FILE_ENCRYPTION_SECRET" = local.secrets.FILE_ENCRYPTION_SECRET
      "FILE_ENCRYPTION_SECRET_SUPPORT" = local.secrets.FILE_ENCRYPTION_SECRET_SUPPORT
      "FRANCE_CONNECT_CLIENT_SECRET" = local.secrets.FRANCE_CONNECT_CLIENT_SECRET
      "JVA_TOKEN" = local.secrets.JVA_TOKEN
      "MONGO_URL" = local.secrets.MONGO_URL
      "SECRET" = local.secrets.SECRET
      "SENDINBLUEKEY" = local.secrets.SENDINBLUEKEY
      "PM2_SLACK_URL" = local.secrets.PM2_SLACK_URL
      "TOKENLOADTEST" = local.secrets.TOKENLOADTEST
      "ZAMMAD_TOKEN" = local.secrets.ZAMMAD_TOKEN
    }
}

# Without DNS Zone
resource scaleway_container_domain test_api {
  container_id = scaleway_container.test_api.id
  hostname = local.api_domain
}


/* With DNS Zone
resource scaleway_domain_record test_api {
  dns_zone = var.dns_zone
  name     = var.api_subdomain
  type     = "CNAME"
  data     = "${scaleway_container.test_api.domain_name}." // Trailing dot is important in CNAME
  ttl      = 600
}

resource scaleway_container_domain test_api {
  container_id = scaleway_container.test_api.id
  hostname = "${scaleway_domain_record.test_api.name}.${scaleway_domain_record.test_api.dns_zone}"
}
*/

# terraform output -raw test_api_domain
output "test_api_domain" {
  value = scaleway_container.test_api.domain_name
}

resource scaleway_container test_admin {
    name = "${var.environment}-${var.admin_app_name}"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/${var.admin_app_name}:${var.image_tag}"
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
        "APP_NAME" = var.admin_app_name
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${local.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${local.app_domain}"
        "DOCKER_ENV_VITE_MAINTENANCE" = "false"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
      "SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
    }
}

# Without DNS Zone
resource scaleway_container_domain test_admin {
  container_id = scaleway_container.test_admin.id
  hostname = local.admin_domain
}

/* With DNS Zone
resource scaleway_domain_record test_admin {
  dns_zone = var.dns_zone
  name     = var.admin_subdomain
  type     = "CNAME"
  data     = "${scaleway_container.test_admin.domain_name}." // Trailing dot is important in CNAME
  ttl      = 600
}

resource scaleway_container_domain test_admin {
  container_id = scaleway_container.test_admin.id
  hostname = "${scaleway_domain_record.test_admin.name}.${scaleway_domain_record.test_admin.dns_zone}"
}
*/

# terraform output -raw test_admin_domain
output "test_admin_domain" {
  value = scaleway_container.test_admin.domain_name
}

resource scaleway_container test_app {
    name = "${var.environment}-${var.app_app_name}"
    namespace_id = scaleway_container_namespace.test.id
    registry_image = "${scaleway_container_namespace.test.registry_endpoint}/${var.app_app_name}:${var.image_tag}"
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
        "APP_NAME" = var.app_app_name
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${local.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${local.app_domain}"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "FOLDER_APP" = var.app_app_name
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
    }
}

# Without DNS Zone
resource scaleway_container_domain test_app {
  container_id = scaleway_container.test_app.id
  hostname = local.app_domain
}

/* With DNS Zone
resource scaleway_domain_record test_app {
  dns_zone = var.dns_zone
  name     = var.app_subdomain
  type     = "CNAME"
  data     = "${scaleway_container.test_app.domain_name}." // Trailing dot is important in CNAME
  ttl      = 600
}

resource scaleway_container_domain test_app {
  container_id = scaleway_container.test_app.id
  hostname = "${scaleway_domain_record.test_app.name}.${scaleway_domain_record.test_app.dns_zone}"
}
*/

# terraform output -raw test_app_domain
output "test_app_domain" {
  value = scaleway_container.test_app.domain_name
}

/*
import {
  to = scaleway_secret.env-test
  id = "fr-par/7adb9d6f-2b17-4d79-bc6f-1a0da3bb7e18"
}

resource "scaleway_secret" "env-test" {
  name        = "env-test"
  project_id  = "a1ef63c1-0c6d-4a19-b368-29d9a20c8a04"
  region      = "fr-par"
}
*/
