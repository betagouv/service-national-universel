
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
variable "antivirus_image_tag" {
  type     = string
  nullable = false
}

locals {
  domain             = "snu.gouv.fr"
  api_hostname       = "api.${local.domain}"
  admin_hostname     = "admin.${local.domain}"
  app_hostname       = "moncompte.${local.domain}"
  antivirus_hostname = "antivirus.beta-snu.dev"
  secrets            = jsondecode(base64decode(data.scaleway_secret_version.production.data))
}

# Secrets
resource "scaleway_secret" "production" {
  name        = "snu-production"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment 'production'"
}
data "scaleway_secret_version" "production" {
  secret_id = scaleway_secret.production.id
  revision  = "latest_enabled"
}

# Containers namespace
resource "scaleway_container_namespace" "production" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-production"
  description = "SNU container namespace for environment 'production'"
}

# Containers
resource "scaleway_container" "api" {
  name            = "production-api"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port            = 8080
  cpu_limit       = 1024
  memory_limit    = 2048
  min_scale       = 4
  max_scale       = 20
  timeout         = 60
  max_concurrency = 25
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "NODE_ENV"       = "production"
  }

  secret_environment_variables = {
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
  }
}

resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.api_hostname
}



resource "scaleway_container" "admin" {
  name            = "production-admin"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/admin:${var.admin_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 20
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "NGINX_HOSTNAME" = local.admin_hostname
    "ENVIRONMENT"    = "production"
  }
}

resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.admin_hostname
}

resource "scaleway_container" "app" {
  name            = "production-app"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/app:${var.app_image_tag}"
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 1
  max_scale       = 20
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "NGINX_HOSTNAME" = local.app_hostname
    "ENVIRONMENT"    = "production"
  }
}

resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.app_hostname
}

resource "scaleway_container" "antivirus" {
  name            = "production-antivirus"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/antivirus:${var.antivirus_image_tag}"
  port            = 8089
  cpu_limit       = 256
  memory_limit    = 4096
  min_scale       = 1
  max_scale       = 5
  timeout         = 60
  max_concurrency = 50
  privacy         = "private"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "APP_NAME" = "antivirus"
  }
}

resource "scaleway_container_domain" "antivirus" {
  container_id = scaleway_container.antivirus.id
  hostname     = local.antivirus_hostname
}

resource "scaleway_container" "crons" {
  name           = "production-crons"
  namespace_id   = scaleway_container_namespace.production.id
  registry_image = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 1024
  min_scale      = 1
  max_scale      = 1
  privacy        = "private"
  protocol       = "http1"
  deploy         = true

  environment_variables = {
    "NODE_ENV"       = "production"
    "RUN_CRONS"      = "true"
  }

  secret_environment_variables = {
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
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
output "crons_container_status" {
  value = scaleway_container.crons.status
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

output "antivirus_endpoint" {
  value = "https://${local.antivirus_hostname}"
}
output "antivirus_image_tag" {
  value = split(":", scaleway_container.antivirus.registry_image)[1]
}
output "antivirus_container_status" {
  value = scaleway_container.antivirus.status
}
