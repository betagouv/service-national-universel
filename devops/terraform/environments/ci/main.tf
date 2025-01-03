terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
      version = "2.47.0"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {}
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

locals {
  organization_id = "db949d19-5fe0-4def-a89b-f801aad2d050" # Selego
  env             = "ci"
  domain          = "ci.beta-snu.dev"
  api_hostname    = "api.${local.domain}"
  apiv2_hostname    = "apiv2.${local.domain}"
  admin_hostname  = "admin.${local.domain}"
  app_hostname    = "moncompte.${local.domain}"
}

# Project
resource "scaleway_account_project" "main" {
  name        = "snu-${local.env}"
  description = "SNU project for '${local.env}'"
}

# Secrets
resource "scaleway_secret" "ci" {
  name        = "snu-${local.env}"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment '${local.env}'"
}

# Logs
resource "scaleway_cockpit" "main" {
  project_id = scaleway_account_project.main.id
}

# Registry
resource "scaleway_registry_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-${local.env}"
  description = "SNU registry for ${local.env}"
  is_public   = false
}

# Deploy application user
resource "scaleway_iam_application" "main" {
  name        = "snu-deploy-${local.env}"
  description = "Application allowed to deploy apps in '${local.env}'"
}

# Deploy policy
resource "scaleway_iam_policy" "deploy" {
  name           = "snu-deploy-${local.env}-policy"
  description    = "Allow to deploy apps in '${local.env}'"
  application_id = scaleway_iam_application.main.id
  rule {
    project_ids = [scaleway_account_project.main.id]
    permission_set_names = [
      "AllProductsFullAccess",
    ]
  }
  rule {
    organization_id = local.organization_id
    permission_set_names = [
      "ProjectReadOnly",
      "IAMReadOnly"
    ]
  }
}

# GetSecret application user
resource "scaleway_iam_application" "get_secret" {
  name        = "snu-get-secret-${local.env}"
  description = "Application allowed to retrieve secrets in '${local.env}'"
}

# GetSecret policy
resource "scaleway_iam_policy" "get_secret" {
  name           = "snu-get-secret-${local.env}-policy"
  description    = "Allow to retrieve secrets in '${local.env}'"
  application_id = scaleway_iam_application.get_secret.id
  rule {
    project_ids = [scaleway_account_project.main.id]
    permission_set_names = [
      "SecretManagerReadOnly",
      "SecretManagerSecretAccess",
    ]
  }
}

# Containers namespace
resource "scaleway_container_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-${local.env}"
  description = "SNU container namespace for environment '${local.env}'"
}

resource "scaleway_container_namespace" "custom" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-custom"
  description = "SNU container namespace for environment 'custom'"
}

# Containers

resource "scaleway_container" "api" {
  name            = "${local.env}-api"
  namespace_id    = scaleway_container_namespace.main.id
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



resource "scaleway_container" "tasks" {
  name           = "${local.env}-tasks"
  namespace_id   = scaleway_container_namespace.main.id
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
  name            = "${local.env}-apiv2"
  namespace_id    = scaleway_container_namespace.main.id
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
  name           = "${local.env}-tasksv2"
  namespace_id   = scaleway_container_namespace.main.id
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
  name            = "${local.env}-admin"
  namespace_id    = scaleway_container_namespace.main.id
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 1
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
  name            = "${local.env}-app"
  namespace_id    = scaleway_container_namespace.main.id
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 1
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
