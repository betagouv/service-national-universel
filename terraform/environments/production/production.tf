
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
variable "antivirus_image_tag" {
  type    = string
  nullable = false
}

locals {
  domain         = "snu.gouv.fr"
  api_hostname   = "api.${local.domain}"
  admin_hostname = "admin.${local.domain}"
  app_hostname   = "moncompte.${local.domain}"
  antivirus_hostname   = "antivirus.beta-snu.dev"
  secrets        = jsondecode(base64decode(data.scaleway_secret_version.production.data))
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
  cpu_limit       = 512
  memory_limit    = 2048
  min_scale       = 4
  max_scale       = 20
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
    "PRODUCTION" = "true"
    "FOLDER_API" = "api"
    "SENTRY_PROFILE_SAMPLE_RATE"        = 0.2
    "SENTRY_TRACING_SAMPLE_RATE"        = 0.01
    "SENTRY_RELEASE"                    = var.api_image_tag
    "API_ANALYTICS_ENDPOINT"            = local.secrets.API_ANALYTICS_ENDPOINT
    "API_ANTIVIRUS_ENDPOINT"            = local.secrets.API_ANTIVIRUS_ENDPOINT
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
    "SLACK_BOT_CHANNEL"                 = local.secrets.SLACK_BOT_CHANNEL
    "SUPPORT_URL"                       = local.secrets.SUPPORT_URL
  }

  secret_environment_variables = {
    "API_ANALYTICS_API_KEY"                 = local.secrets.API_ANALYTICS_API_KEY
    "API_ANTIVIRUS_TOKEN"                   = local.secrets.API_ANTIVIRUS_TOKEN
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = local.secrets.API_ASSOCIATION_CELLAR_KEYSECRET
    "API_ASSOCIATION_ES_ENDPOINT"           = local.secrets.API_ASSOCIATION_ES_ENDPOINT
    "API_ENGAGEMENT_KEY"                    = local.secrets.API_ENGAGEMENT_KEY
    "CELLAR_KEYSECRET"                      = local.secrets.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = local.secrets.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = local.secrets.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = local.secrets.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = local.secrets.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = local.secrets.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = local.secrets.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_API_KEY"                           = local.secrets.JVA_API_KEY
    "JVA_TOKEN"                             = local.secrets.JVA_TOKEN
    "MONGO_URL"                             = local.secrets.MONGO_URL
    "QPV_PASSWORD"                          = local.secrets.QPV_PASSWORD
    "QPV_USERNAME"                          = local.secrets.QPV_USERNAME
    "SECRET"                                = local.secrets.SECRET
    "SENDINBLUEKEY"                         = local.secrets.SENDINBLUEKEY
    "SENTRY_AUTH_TOKEN"                     = local.secrets.SENTRY_AUTH_TOKEN
    "SLACK_BOT_TOKEN"                       = local.secrets.SLACK_BOT_TOKEN
    "SUPPORT_APIKEY"                        = local.secrets.SUPPORT_APIKEY
    "PM2_SLACK_URL"                         = local.secrets.PM2_SLACK_URL
    "TOKENLOADTEST"                         = local.secrets.TOKENLOADTEST
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
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "APP_NAME"                                   = "admin"
    "CLE"                                        = "true"
    "PROD"                                       = "true"
    "DOCKER_ENV_VITE_ADMIN_URL"                  = "https://${local.admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"                    = "https://${local.api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"                    = "https://${local.app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = 0.005
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = 0.01
    "DOCKER_ENV_VITE_SUPPORT_URL"                = "https://support.snu.gouv.fr"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = local.secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = local.secrets.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
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
  max_scale       = 1
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "APP_NAME"                                   = "app"
    "CLE"                                        = "true"
    "PROD"                                       = "true"
    "DOCKER_ENV_VITE_ADMIN_URL"                  = "https://${local.admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"                    = "https://${local.api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"                    = "https://${local.app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = 0.005
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = 0.01
    "DOCKER_ENV_VITE_SUPPORT_URL"                = "https://support.snu.gouv.fr"
    "DOCKER_ENV_VITE_FRANCE_CONNECT_URL"         = "https://app.franceconnect.gouv.fr/api/v1"
    "FOLDER_APP"                                 = "app"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"          = local.secrets.SENTRY_AUTH_TOKEN
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
  memory_limit    = 2048
  min_scale       = 1
  max_scale       = 5
  timeout         = 60
  max_concurrency = 50
  privacy         = "private"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "APP_NAME"   = "antivirus"
  }
}

resource "scaleway_container_domain" "antivirus" {
  container_id = scaleway_container.antivirus.id
  hostname     = local.antivirus_hostname
}

resource "scaleway_container" "crons" {
  name            = "production-crons"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  port            = 8080
  cpu_limit       = 768
  memory_limit    = 1024
  min_scale       = 1
  max_scale       = 1
  privacy         = "private"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge(scaleway_container.api.environment_variables, {
    "RUN_CRONS" = "true"
  })

  secret_environment_variables = scaleway_container.api.secret_environment_variables
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
output "antivirus_endpoint" {
  value = "https://${local.antivirus_hostname}"
}
output "antivirus_image_tag" {
  value = split(":", scaleway_container.antivirus.registry_image)[1]
}
