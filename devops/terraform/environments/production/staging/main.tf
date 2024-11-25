terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
      version = "2.47.0"
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

locals {
  project_id     = "a0c93450-f68c-4768-8fe8-6e07a1644530"
  domain         = "beta-snu.dev"
  api_hostname   = "api.${local.domain}"
  apiv2_hostname    = "apiv2.${local.domain}"
  admin_hostname = "admin.${local.domain}"
  app_hostname   = "moncompte.${local.domain}"
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
  sandbox         = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "tasks" {
  name           = "staging-tasks"
  namespace_id   = scaleway_container_namespace.staging.id
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 2048
  min_scale      = 1
  max_scale      = 1
  privacy        = "public"
  protocol       = "http1"
  deploy         = true
  http_option    = "redirected"
  sandbox        = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "apiv2" {
  name            = "staging-apiv2"
  namespace_id    = scaleway_container_namespace.staging.id
  port            = 8080
  cpu_limit       = 1024
  memory_limit    = 2048
  min_scale       = 1
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"
  sandbox         = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}


resource "scaleway_container" "tasksv2" {
  name           = "staging-tasksv2"
  namespace_id   = scaleway_container_namespace.staging.id
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 2048
  min_scale      = 1
  max_scale      = 1
  privacy        = "public"
  protocol       = "http1"
  deploy         = true
  http_option    = "redirected"
  sandbox        = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}


resource "scaleway_container" "admin" {
  name            = "staging-admin"
  namespace_id    = scaleway_container_namespace.staging.id
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

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "app" {
  name            = "staging-app"
  namespace_id    = scaleway_container_namespace.staging.id
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

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}


resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.api_hostname
}
resource "scaleway_container_domain" "apiv2" {
  container_id = scaleway_container.apiv2.id
  hostname     = local.apiv2_hostname
}
resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.admin_hostname
}
resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.app_hostname
}
