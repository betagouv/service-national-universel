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

  environment_variables = {
    "APP_NAME"                          = "api"
    "API_URL"                           = "https://${local.api_hostname}"
    "ADMIN_URL"                         = "https://${local.admin_hostname}"
    "APP_URL"                           = "https://${local.app_hostname}"
    "ENVIRONMENT"                       = "custom"
    "FOLDER_API"                        = "api"
    "RELEASE"                           = var.api_image_tag
    "SENTRY_PROFILE_SAMPLE_RATE"        = 0.8
    "SENTRY_TRACING_SAMPLE_RATE"        = 0.1
    "API_ANALYTICS_ENDPOINT"            = local.secrets.API_ANALYTICS_ENDPOINT
    "API_ANTIVIRUS_ENDPOINT"            = local.secrets.API_ANTIVIRUS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"   = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"      = local.secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_ENGAGEMENT_URL"                = local.secrets.API_ENGAGEMENT_URL
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
    "API_ANTIVIRUS_TOKEN"                   = local.secrets.API_ANTIVIRUS_TOKEN
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

  environment_variables = {
    "NGINX_HOSTNAME"             = local.admin_hostname
    "APP_NAME"                   = "admin"
    "ENVIRONMENT"                = "custom"
    "ADMIN_URL"                  = "https://${local.admin_hostname}"
    "API_URL"                    = "https://${local.api_hostname}"
    "APP_URL"                    = "https://${local.app_hostname}"
    "RELEASE"                    = var.admin_image_tag
    "SENTRY_SESSION_SAMPLE_RATE" = 0.1
    "SENTRY_TRACING_SAMPLE_RATE" = 0.1
    "SUPPORT_URL"                = "https://support.beta-snu.dev"
  }

  secret_environment_variables = {
    "SENTRY_URL"                 = local.secrets.SENTRY_ADMIN
    "SENTRY_AUTH_TOKEN"          = local.secrets.SENTRY_AUTH_TOKEN
    "VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
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

  environment_variables = {
    "NGINX_HOSTNAME"             = local.app_hostname
    "APP_NAME"                   = "app"
    "ENVIRONMENT"                = "custom"
    "ADMIN_URL"                  = "https://${local.admin_hostname}"
    "API_URL"                    = "https://${local.api_hostname}"
    "APP_URL"                    = "https://${local.app_hostname}"
    "RELEASE"                    = var.app_image_tag
    "SENTRY_SESSION_SAMPLE_RATE" = 0.1
    "SENTRY_TRACING_SAMPLE_RATE" = 0.1
    "SUPPORT_URL"                = "https://support.beta-snu.dev"
    "API_ENGAGEMENT_URL"         = local.secrets.API_ENGAGEMENT_URL
    "API_ENGAGEMENT_SNU_ID"      = local.secrets.API_ENGAGEMENT_SNU_ID
  }

  secret_environment_variables = {
    "SENTRY_URL"        = local.secrets.SENTRY_MONCOMPTE
    "SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
  }
}

output "api_endpoint" {
  value = "https://${local.api_hostname}"
}
output "api_container_id" {
  value = scaleway_container.api.id
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
output "app_container_id" {
  value = scaleway_container.app.id
}

output "admin_endpoint" {
  value = "https://${local.admin_hostname}"
}
output "admin_image_tag" {
  value = split(":", scaleway_container.admin.registry_image)[1]
}
output "admin_container_id" {
  value = scaleway_container.admin.id
}
