
variable "prod_image_tag" {
  type    = string
  default = "latest"
}

locals {
  prod_domain         = "snu.gouv.fr"
  prod_api_hostname   = "api.${local.prod_domain}"
  prod_admin_hostname = "admin.${local.prod_domain}"
  prod_app_hostname   = "moncompte.${local.prod_domain}"
  prod_secrets        = jsondecode(base64decode(data.scaleway_secret_version.production.data))
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
resource "scaleway_container" "production_api" {
  name            = "production-api"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/api:${var.prod_image_tag}"
  port            = 8080
  cpu_limit       = 768
  memory_limit    = 1024
  min_scale       = 1
  max_scale       = 20
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = {
    "APP_NAME"   = "api"
    "ADMIN_URL"  = "https://${local.prod_admin_hostname}"
    "APP_URL"    = "https://${local.prod_app_hostname}"
    "CLE"        = "true"
    "PRODUCTION" = "true"
    "FOLDER_API" = "api"
    "SENTRY_PROFILE_SAMPLE_RATE" : "0.8"
    "SENTRY_TRACING_SAMPLE_RATE" : "0.1"
    "API_ANALYTICS_ENDPOINT"            = local.prod_secrets.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.prod_secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"   = local.prod_secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"      = local.prod_secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_PDF_ENDPOINT"                  = local.prod_secrets.API_PDF_ENDPOINT
    "BUCKET_NAME"                       = local.prod_secrets.BUCKET_NAME
    "CELLAR_ENDPOINT"                   = local.prod_secrets.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"           = local.prod_secrets.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                      = local.prod_secrets.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"              = local.prod_secrets.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                   = local.prod_secrets.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"          = local.prod_secrets.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                = local.prod_secrets.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                 = local.prod_secrets.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                = local.prod_secrets.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"        = local.prod_secrets.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                        = local.prod_secrets.SENTRY_URL
    "SUPPORT_URL"                       = local.prod_secrets.SUPPORT_URL
  }

  secret_environment_variables = {
    "API_ANALYTICS_API_KEY"                 = local.prod_secrets.API_ANALYTICS_API_KEY
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.prod_secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = local.prod_secrets.API_ASSOCIATION_CELLAR_KEYSECRET
    "API_ASSOCIATION_ES_ENDPOINT"           = local.prod_secrets.API_ASSOCIATION_ES_ENDPOINT
    "CELLAR_KEYSECRET"                      = local.prod_secrets.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = local.prod_secrets.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = local.prod_secrets.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = local.prod_secrets.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = local.prod_secrets.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = local.prod_secrets.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = local.prod_secrets.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_TOKEN"                             = local.prod_secrets.JVA_TOKEN
    "MONGO_URL"                             = local.prod_secrets.MONGO_URL
    "SECRET"                                = local.prod_secrets.SECRET
    "SENDINBLUEKEY"                         = local.prod_secrets.SENDINBLUEKEY
    "SUPPORT_APIKEY"                        = local.prod_secrets.SUPPORT_APIKEY
    "PM2_SLACK_URL"                         = local.prod_secrets.PM2_SLACK_URL
    "TOKENLOADTEST"                         = local.prod_secrets.TOKENLOADTEST
    "ZAMMAD_TOKEN"                          = local.prod_secrets.ZAMMAD_TOKEN
  }
}

resource "scaleway_container_domain" "production_api" {
  container_id = scaleway_container.production_api.id
  hostname     = local.prod_api_hostname
}



resource "scaleway_container" "production_admin" {
  name            = "production-admin"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/admin:${var.prod_image_tag}"
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
    "DOCKER_ENV_VITE_ADMIN_URL"                  = "https://${local.prod_admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"                    = "https://${local.prod_api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"                    = "https://${local.prod_app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.005"
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = "0.01"
    "DOCKER_ENV_VITE_SUPPORT_URL"                = "https://support.snu.gouv.fr"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = local.prod_secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = local.prod_secrets.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.prod_secrets.USERBACK_ACCESS_TOKEN
  }
}

resource "scaleway_container_domain" "production_admin" {
  container_id = scaleway_container.production_admin.id
  hostname     = local.prod_admin_hostname
}

resource "scaleway_container" "production_app" {
  name            = "production-app"
  namespace_id    = scaleway_container_namespace.production.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/app:${var.prod_image_tag}"
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
    "DOCKER_ENV_VITE_ADMIN_URL"                  = "https://${local.prod_admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"                    = "https://${local.prod_api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"                    = "https://${local.prod_app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.005"
    "DOCKER_ENV_VITE_SENTRY_TRACING_SAMPLE_RATE" = "0.01"
    "DOCKER_ENV_VITE_SUPPORT_URL"                = "https://support.snu.gouv.fr"
    "DOCKER_ENV_VITE_FRANCE_CONNECT_URL"         = "https://app.franceconnect.gouv.fr/api/v1"
    "FOLDER_APP"                                 = "app"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"        = local.prod_secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN" = local.prod_secrets.SENTRY_AUTH_TOKEN
  }
}

resource "scaleway_container_domain" "production_app" {
  container_id = scaleway_container.production_app.id
  hostname     = local.prod_app_hostname
}

output "prod_image_tag" {
  value = split(":", scaleway_container.production_api.registry_image)[1]
}
output "prod_api_endpoint" {
  value = "https://${local.prod_api_hostname}"
}
output "prod_app_endpoint" {
  value = "https://${local.prod_app_hostname}"
}
output "prod_admin_endpoint" {
  value = "https://${local.prod_admin_hostname}"
}
