terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {
    schema_name = "apps_staging"
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

locals {
  project_id     = "a0c93450-f68c-4768-8fe8-6e07a1644530"
  domain         = "beta-snu.dev"
  api_hostname   = "api.${local.domain}"
  admin_hostname = "admin.${local.domain}"
  app_hostname   = "moncompte.${local.domain}"
  secrets        = jsondecode(base64decode(data.scaleway_secret_version.staging.data))
}

# Project
data "scaleway_account_project" "main" {
  project_id = local.project_id
}

# Registry
data "scaleway_registry_namespace" "main" {
  name = "snu-production"
}

# Secrets
resource "scaleway_secret" "staging" {
  name        = "snu-staging"
  project_id  = data.scaleway_account_project.main.id
  description = "Secrets for environment 'staging'"
}
data "scaleway_secret_version" "staging" {
  secret_id = scaleway_secret.staging.id
  revision  = "latest_enabled"
}

# Containers namespace
resource "scaleway_container_namespace" "staging" {
  project_id  = data.scaleway_account_project.main.id
  name        = "snu-staging"
  description = "SNU container namespace for environment 'staging'"
}

# Containers
resource "scaleway_container" "api" {
  name            = "staging-api"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port            = 8080
  cpu_limit       = 768
  memory_limit    = 1024
  min_scale       = 1
  max_scale       = 3
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NODE_ENV"       = "staging"
  }

  secret_environment_variables = {
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
  }
}

resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.api_hostname
}

resource "scaleway_container" "tasks" {
  name           = "staging-tasks"
  namespace_id   = scaleway_container_namespace.staging.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 2048
  min_scale      = 1
  max_scale      = 1
  privacy        = "public"
  protocol       = "http1"
  deploy         = true
  http_option    = "redirected"

  environment_variables = {
    "NODE_ENV"       = "staging"
    "RUN_TASKS"      = "true"
  }

  secret_environment_variables = {
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
  }
}



resource "scaleway_container" "admin" {
  name            = "staging-admin"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/admin:${var.admin_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 2
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NGINX_HOSTNAME" = local.admin_hostname
    "ENVIRONMENT"    = "staging"
  }
}

resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.admin_hostname
}

resource "scaleway_container" "app" {
  name            = "staging-app"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${data.scaleway_registry_namespace.main.endpoint}/app:${var.app_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 2
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  environment_variables = {
    "NGINX_HOSTNAME" = local.app_hostname
    "ENVIRONMENT"    = "staging"
  }
}

resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.app_hostname
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
