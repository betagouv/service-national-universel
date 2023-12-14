locals {
  staging_domain         = "beta-snu.dev"
  staging_api_hostname   = "api.${local.staging_domain}"
  staging_admin_hostname = "admin.${local.staging_domain}"
  staging_app_hostname   = "moncompte.${local.staging_domain}"
  staging_secrets        = jsondecode(base64decode(data.scaleway_secret_version.staging.data))
}

# Secrets
resource "scaleway_secret" "staging" {
  name        = "snu-staging"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment 'staging'"
}
data "scaleway_secret_version" "staging" {
  secret_id = scaleway_secret.staging.id
  revision  = "latest_enabled"
}

# Containers namespace
resource "scaleway_container_namespace" "staging" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-staging"
  description = "SNU container namespace for environment 'staging'"
}

# Containers
resource "scaleway_container" "staging_api" {
  name            = "staging-api"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/api:${var.image_tag}"
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
    "ADMIN_URL"  = "https://${local.staging_admin_hostname}"
    "APP_URL"    = "https://${local.staging_app_hostname}"
    "CLE"        = "true"
    "STAGING"    = "true"
    "FOLDER_API" = "api"
    "SENTRY_PROFILE_SAMPLE_RATE" : "0.8"
    "SENTRY_TRACING_SAMPLE_RATE" : "0.1"
    "API_ANALYTICS_ENDPOINT"            = local.staging_secrets.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.staging_secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"   = local.staging_secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"      = local.staging_secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_PDF_ENDPOINT"                  = local.staging_secrets.API_PDF_ENDPOINT
    "BUCKET_NAME"                       = local.staging_secrets.BUCKET_NAME
    "CELLAR_ENDPOINT"                   = local.staging_secrets.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"           = local.staging_secrets.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                      = local.staging_secrets.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"              = local.staging_secrets.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                   = local.staging_secrets.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"          = local.staging_secrets.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                = local.staging_secrets.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                 = local.staging_secrets.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                = local.staging_secrets.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"        = local.staging_secrets.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                        = local.staging_secrets.SENTRY_URL
    "SUPPORT_URL"                       = local.staging_secrets.SUPPORT_URL
  }

  secret_environment_variables = {
    "API_ANALYTICS_API_KEY"                 = local.staging_secrets.API_ANALYTICS_API_KEY
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.staging_secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = local.staging_secrets.API_ASSOCIATION_CELLAR_KEYSECRET
    "API_ASSOCIATION_ES_ENDPOINT"           = local.staging_secrets.API_ASSOCIATION_ES_ENDPOINT
    "CELLAR_KEYSECRET"                      = local.staging_secrets.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = local.staging_secrets.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = local.staging_secrets.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = local.staging_secrets.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = local.staging_secrets.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = local.staging_secrets.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = local.staging_secrets.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_TOKEN"                             = local.staging_secrets.JVA_TOKEN
    "MONGO_URL"                             = local.staging_secrets.MONGO_URL
    "SECRET"                                = local.staging_secrets.SECRET
    "SENDINBLUEKEY"                         = local.staging_secrets.SENDINBLUEKEY
    "SUPPORT_APIKEY"                        = local.staging_secrets.SUPPORT_APIKEY
    "PM2_SLACK_URL"                         = local.staging_secrets.PM2_SLACK_URL
    "TOKENLOADTEST"                         = local.staging_secrets.TOKENLOADTEST
    "ZAMMAD_TOKEN"                          = local.staging_secrets.ZAMMAD_TOKEN
  }
}

resource "scaleway_container_domain" "staging_api" {
  container_id = scaleway_container.staging_api.id
  hostname     = local.staging_api_hostname
}



resource "scaleway_container" "staging_admin" {
  name            = "staging-admin"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/admin:${var.image_tag}"
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
    "APP_NAME"                  = "admin"
    "CLE"                       = "true"
    "STAGING"                   = "true"
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.staging_admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.staging_api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.staging_app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" : "0.1"
    "DOCKER_ENV_VITE_SUPPORT_URL" : "https://support.beta-snu.dev"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = local.staging_secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = local.staging_secrets.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.staging_secrets.USERBACK_ACCESS_TOKEN
  }
}

resource "scaleway_container_domain" "staging_admin" {
  container_id = scaleway_container.staging_admin.id
  hostname     = local.staging_admin_hostname
}

resource "scaleway_container" "staging_app" {
  name            = "staging-app"
  namespace_id    = scaleway_container_namespace.staging.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/app:${var.image_tag}"
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
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.staging_admin_hostname}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.staging_api_hostname}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.staging_app_hostname}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" : "0.1"
    "DOCKER_ENV_VITE_SUPPORT_URL" : "https://support.beta-snu.dev"
    "FOLDER_APP" = "app"
  }

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"        = local.staging_secrets.SENTRY_URL
    "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = local.staging_secrets.SENTRY_AUTH_TOKEN
  }
}

resource "scaleway_container_domain" "staging_app" {
  container_id = scaleway_container.staging_app.id
  hostname     = local.staging_app_hostname
}
