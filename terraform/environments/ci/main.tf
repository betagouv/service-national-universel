terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {}
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
  organization_id = "db949d19-5fe0-4def-a89b-f801aad2d050" # Selego
  env             = "ci"
  domain          = "ci.beta-snu.dev"
  api_hostname    = "api.${local.domain}"
  admin_hostname  = "admin.${local.domain}"
  app_hostname    = "moncompte.${local.domain}"
  secrets         = jsondecode(base64decode(data.scaleway_secret_version.main.data))
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
data "scaleway_secret_version" "main" {
  secret_id = scaleway_secret.ci.id
  revision  = "latest_enabled"
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

# Application user
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

# DNS zone
resource "scaleway_domain_zone" "main" {
  project_id = scaleway_account_project.main.id
  domain     = local.domain
  subdomain  = ""
}

resource "scaleway_container" "api" {
  name            = "${local.env}-api"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port            = 8080
  cpu_limit       = 768
  memory_limit    = 1024
  min_scale       = 1
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "NODE_ENV"    = "ci"
  }

  secret_environment_variables = {
    "SCW_ACCESS_KEY" = local.secrets.SCW_ACCESS_KEY
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
  }

resource "scaleway_domain_record" "api" {
  dns_zone = scaleway_domain_zone.main.id
  name     = "api"
  type     = "CNAME"
  data     = "${scaleway_container.api.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.api_hostname
}



resource "scaleway_container" "admin" {
  name            = "${local.env}-admin"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/admin:${var.admin_image_tag}"
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

  environment_variables = {
    "NGINX_HOSTNAME" = local.admin_hostname
    "ENVIRONMENT"    = "ci"
  }
}

resource "scaleway_domain_record" "admin" {
  dns_zone = scaleway_domain_zone.main.id
  name     = "admin"
  type     = "CNAME"
  data     = "${scaleway_container.admin.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.admin_hostname
}

resource "scaleway_container" "app" {
  name            = "${local.env}-app"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/app:${var.app_image_tag}"
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

  environment_variables = {
    "NGINX_HOSTNAME" = local.app_hostname
    "ENVIRONMENT"    = "ci"
  }
}

resource "scaleway_domain_record" "app" {
  dns_zone = scaleway_domain_zone.main.id
  name     = "moncompte"
  type     = "CNAME"
  data     = "${scaleway_container.app.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.app_hostname
}


output "project_id" {
  value = scaleway_account_project.main.id
}
output "secret_id" {
  value = scaleway_secret.ci.id
}
output "registry_endpoint" {
  value = scaleway_registry_namespace.main.endpoint
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
