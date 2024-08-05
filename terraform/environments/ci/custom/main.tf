terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {
    schema_name = "apps_###___ENV_NAME___###"
  }
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

variable "api_image_tag" {
  type     = string
  nullable = false
}
variable "admin_image_tag" {
  type     = string
  nullable = false
}
variable "app_image_tag" {
  type     = string
  nullable = false
}

# On recupere le nom du namespace en se basant sur le nom du registry lie au namespace car scaleway utilise toujours le meme pattern pour creer l'url du custom env
locals {
  env            = "###___ENV_NAME___###"
  project_id     = "1b29c5d9-9723-400a-aa8b-0c85ae3567f7"
  domain         = "functions.fnc.fr-par.scw.cloud"
  domain_prefix  = split("funcscw", data.scaleway_container_namespace.main.registry_endpoint)[1]
  api_hostname   = "${local.domain_prefix}-${local.env}-api.${local.domain}"
  admin_hostname = "${local.domain_prefix}-${local.env}-admin.${local.domain}"
  app_hostname   = "${local.domain_prefix}-${local.env}-app.${local.domain}"
  secrets        = jsondecode(base64decode(data.scaleway_secret_version.latest.data))
}

# Registry
data "scaleway_registry_namespace" "main" {
  name = "snu-ci"
}


# Secrets
resource "scaleway_secret" "custom" {
  name        = "snu-${local.env}"
  project_id  = local.project_id
  description = "Secrets for environment '${local.env}'"
}

data "scaleway_secret" "ci" {
  name = "snu-ci"
  project_id  = local.project_id
}

data "scaleway_secret_version" "ci_latest" {
  secret_id = data.scaleway_secret.ci.id
  revision  = "latest_enabled"
}

resource "scaleway_secret_version" "initial" {
  secret_id   = scaleway_secret.custom.id
  data        = base64decode(data.scaleway_secret_version.ci_latest.data)

  lifecycle {
    ignore_changes = [data]
  }
}

data "scaleway_secret_version" "latest" {
  secret_id = scaleway_secret.custom.id
  revision  = "latest_enabled"

  depends_on = [scaleway_secret_version.initial]
}

# Containers namespace
data "scaleway_container_namespace" "main" {
  name = "snu-custom"
}

# Containers
resource "scaleway_container" "api" {
  name            = "${local.env}-api"
  namespace_id    = data.scaleway_container_namespace.main.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port            = 8080
  cpu_limit       = 768
  memory_limit    = 2048
  min_scale       = 0
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NODE_ENV"       = "custom"
    "API_URL"        = "https://${local.api_hostname}"
    "ADMIN_URL"      = "https://${local.admin_hostname}"
    "APP_URL"        = "https://${local.app_hostname}"
    "SECRET_NAME"    = scaleway_secret.custom.name
    "ENABLE_FLATTEN_ERROR_LOGS" = "false"
  }

  secret_environment_variables = {
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
    "ES_HOST" = local.secrets.ES_HOST
    "ES_USER" = local.secrets.ES_USER
    "ES_PASSWORD" = local.secrets.ES_PASSWORD
  }
}

resource "scaleway_container" "admin" {
  name            = "${local.env}-admin"
  namespace_id    = data.scaleway_container_namespace.main.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/admin:${var.admin_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 0
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NGINX_HOSTNAME"             = local.admin_hostname
    "ENVIRONMENT"                = "custom"
    "ADMIN_URL"                  = "https://${local.admin_hostname}"
    "API_URL"                    = "https://${local.api_hostname}"
    "APP_URL"                    = "https://${local.app_hostname}"
  }
}

resource "scaleway_container" "app" {
  name            = "${local.env}-app"
  namespace_id    = data.scaleway_container_namespace.main.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/app:${var.app_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 0
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NGINX_HOSTNAME"             = local.app_hostname
    "ENVIRONMENT"                = "custom"
    "ADMIN_URL"                  = "https://${local.admin_hostname}"
    "API_URL"                    = "https://${local.api_hostname}"
    "APP_URL"                    = "https://${local.app_hostname}"
  }
}

output "api_endpoint" {
  value = "https://${local.api_hostname}"
}
output "api_image_tag" {
  value = split(":", scaleway_container.api.registry_image)[1]
}
output "api_container_status" {
  value = scaleway_container.api.status
}

output "app_endpoint" {
  value = "https://${local.app_hostname}"
}
output "app_image_tag" {
  value = split(":", scaleway_container.app.registry_image)[1]
}
output "app_container_status" {
  value = scaleway_container.app.status
}

output "admin_endpoint" {
  value = "https://${local.admin_hostname}"
}
output "admin_image_tag" {
  value = split(":", scaleway_container.admin.registry_image)[1]
}
output "admin_container_status" {
  value = scaleway_container.admin.status
}
