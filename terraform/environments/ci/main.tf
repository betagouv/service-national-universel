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
  type    = string
  nullable = false
}
variable "admin_image_tag" {
  type    = string
  nullable = false
}
variable "app_image_tag" {
  type    = string
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
    "APP_NAME"   = "api"
    "ADMIN_URL"  = "https://${local.admin_hostname}"
    "APP_URL"    = "https://${local.app_hostname}"
    "CLE"        = "true"
    "STAGING"    = "true"
    "FOLDER_API" = "api"
    "SENTRY_PROFILE_SAMPLE_RATE"        = 0.8
    "SENTRY_TRACING_SAMPLE_RATE"        = 0.1
    "SENTRY_RELEASE"                    = var.api_image_tag
    "API_ANALYTICS_ENDPOINT"            = local.secrets.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"   = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"      = local.secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_PDF_ENDPOINT"                  = local.secrets.API_PDF_ENDPOINT
    "BUCKET_NAME"                       = local.secrets.BUCKET_NAME
    "CELLAR_ENDPOINT"                   = local.secrets.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"           = local.secrets.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                      = local.secrets.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"              = local.secrets.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                   = local.secrets.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"          = local.secrets.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                = local.secrets.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                 = local.secrets.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                = local.secrets.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"        = local.secrets.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                        = local.secrets.SENTRY_URL
    "SUPPORT_URL"                       = local.secrets.SUPPORT_URL
  }

  secret_environment_variables = {
    "API_ANALYTICS_API_KEY"                 = local.secrets.API_ANALYTICS_API_KEY
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = local.secrets.API_ASSOCIATION_CELLAR_KEYSECRET
    "API_ASSOCIATION_ES_ENDPOINT"           = local.secrets.API_ASSOCIATION_ES_ENDPOINT
    "CELLAR_KEYSECRET"                      = local.secrets.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = local.secrets.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = local.secrets.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = local.secrets.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = local.secrets.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = local.secrets.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = local.secrets.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_TOKEN"                             = local.secrets.JVA_TOKEN
    "MONGO_URL"                             = local.secrets.MONGO_URL
    "SECRET"                                = local.secrets.SECRET
    "SENDINBLUEKEY"                         = local.secrets.SENDINBLUEKEY
    "SUPPORT_APIKEY"                        = local.secrets.SUPPORT_APIKEY
    "PM2_SLACK_URL"                         = local.secrets.PM2_SLACK_URL
    "TOKENLOADTEST"                         = local.secrets.TOKENLOADTEST
  }
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
    "BLOP"                      = "true"
    "APP_NAME"                  = "admin"
    "CLE"                       = "true"
    "STAGING"                   = "true"
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = 0.1
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = 0.1
    "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = local.secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = local.secrets.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
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
    "APP_NAME"                  = "app"
    "CLE"                       = "true"
    "STAGING"                   = "true"
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = 0.1
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = 0.1
    "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
    "FOLDER_APP" = "app"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"          = local.secrets.SENTRY_AUTH_TOKEN
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
output "app_endpoint" {
  value = "https://${local.app_hostname}"
}
output "app_image_tag" {
  value = split(":", scaleway_container.app.registry_image)[1]
}
output "admin_endpoint" {
  value = "https://${local.admin_hostname}"
}
output "admin_image_tag" {
  value = split(":", scaleway_container.admin.registry_image)[1]
}
