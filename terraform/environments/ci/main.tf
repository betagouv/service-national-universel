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

locals {
  iam_role         = "ci"
  env_key          = "ci"
  env              = var.environments[local.env_key]
  app_api          = local.env.apps.api
  domain_api       = "${local.app_api.subdomain}.${local.env.dns_zone}.${local.env.domain}"
  app_admin        = local.env.apps.admin
  domain_admin     = "${local.app_admin.subdomain}.${local.env.dns_zone}.${local.env.domain}"
  app_app          = local.env.apps.app
  domain_app       = "${local.app_app.subdomain}.${local.env.dns_zone}.${local.env.domain}"
  secrets          = jsondecode(base64decode(data.scaleway_secret_version.main.data))
}

# Project
resource "scaleway_account_project" "main" {
  name        = "snu-${local.iam_role}"
  description = "SNU project for '${local.iam_role}'"
}

# Secrets
resource "scaleway_secret" "ci" {
  name        = "snu-${local.env_key}"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment '${local.env_key}'"
}
data "scaleway_secret_version" "main" {
  secret_id = scaleway_secret.ci.id
  revision  = local.env.secret_revision
}

# Logs
resource "scaleway_cockpit" "main" {
  project_id = scaleway_account_project.main.id
}

# Registry
resource "scaleway_registry_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-${local.iam_role}"
  description = "SNU registry for ${local.iam_role}"
  is_public   = false
}

# Application user
resource "scaleway_iam_application" "main" {
  name        = "snu-deploy-${local.iam_role}"
  description = "Application allowed to deploy apps in '${local.iam_role}'"
}

# Deploy policy
resource "scaleway_iam_policy" "deploy" {
  name           = "snu-deploy-${local.iam_role}-policy"
  description    = "Allow to deploy apps in '${local.iam_role}'"
  application_id = scaleway_iam_application.main.id
  rule {
    project_ids          = [scaleway_account_project.main.id]
    permission_set_names = [
      "AllProductsFullAccess",
    ]
  }
}

# Containers namespace
resource "scaleway_container_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-${local.env_key}"
  description = "SNU container namespace for environment '${local.env_key}'"
}

# Containers

# DNS zone
resource "scaleway_domain_zone" "main" {
  project_id = scaleway_account_project.main.id
  domain     = local.env.domain
  subdomain  = local.env.dns_zone
}

resource "scaleway_container" "api" {
  name            = "${local.env_key}-${local.app_api.name}"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${local.app_api.name}:${local.env.image_tag}"
  port            = 8080
  cpu_limit       = local.app_api.cpu_limit
  memory_limit    = local.app_api.memory_limit
  min_scale       = local.app_api.min_scale
  max_scale       = local.app_api.max_scale
  timeout         = local.app_api.timeout
  max_concurrency = local.app_api.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = local.app_api.name
    "ADMIN_URL" = "https://${local.domain_admin}"
    "APP_URL"   = "https://${local.domain_app}"
    "FOLDER_API"                = local.app_api.name
    "SENTRY_PROFILE_SAMPLE_RATE": "0.8"
    "SENTRY_TRACING_SAMPLE_RATE": "0.1"
    "API_ANALYTICS_ENDPOINT"                = local.secrets.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID"     = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"       = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"          = local.secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_PDF_ENDPOINT"                      = local.secrets.API_PDF_ENDPOINT
    "BUCKET_NAME"                           = local.secrets.BUCKET_NAME
    "CELLAR_ENDPOINT"                       = local.secrets.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"               = local.secrets.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                          = local.secrets.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"                  = local.secrets.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                       = local.secrets.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"              = local.secrets.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                    = local.secrets.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                     = local.secrets.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                    = local.secrets.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"            = local.secrets.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                            = local.secrets.SENTRY_URL
    "SUPPORT_URL"                           = local.secrets.SUPPORT_URL
  }, local.app_api.environment_variables)

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
    "ZAMMAD_TOKEN"                          = local.secrets.ZAMMAD_TOKEN
  }
}

resource "scaleway_domain_record" "api" {
  dns_zone = scaleway_domain_zone.main.id
  name     = local.app_api.subdomain
  type     = "CNAME"
  data     = "${scaleway_container.api.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.domain_api
}



resource "scaleway_container" "admin" {
  name            = "${local.env_key}-${local.app_admin.name}"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${local.app_admin.name}:${local.env.image_tag}"
  port            = 8080
  cpu_limit       = local.app_admin.cpu_limit
  memory_limit    = local.app_admin.memory_limit
  min_scale       = local.app_admin.min_scale
  max_scale       = local.app_admin.max_scale
  timeout         = local.app_admin.timeout
  max_concurrency = local.app_admin.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = local.app_admin.name
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.domain_admin}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.domain_api}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.domain_app}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE": "0.1"
    "DOCKER_ENV_VITE_SUPPORT_URL": "https://support.beta-snu.dev"
  }, local.app_admin.environment_variables)

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = local.secrets.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = local.secrets.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
  }
}

resource "scaleway_domain_record" "admin" {
  dns_zone = scaleway_domain_zone.main.id
  name     = local.app_admin.subdomain
  type     = "CNAME"
  data     = "${scaleway_container.admin.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.domain_admin
}

resource "scaleway_container" "app" {
  name            = "${local.env_key}-${local.app_app.name}"
  namespace_id    = scaleway_container_namespace.main.id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${local.app_app.name}:${local.env.image_tag}"
  port            = 8080
  cpu_limit       = local.app_app.cpu_limit
  memory_limit    = local.app_app.memory_limit
  min_scale       = local.app_app.min_scale
  max_scale       = local.app_app.max_scale
  timeout         = local.app_app.timeout
  max_concurrency = local.app_app.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = local.app_app.name
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.domain_admin}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${local.domain_api}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${local.domain_app}"
    "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE": "0.1"
    "DOCKER_ENV_VITE_SUPPORT_URL": "https://support.beta-snu.dev"
    "FOLDER_APP"                = local.app_app.name
  }, local.app_app.environment_variables)

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"        = local.secrets.SENTRY_URL
    "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
  }
}

resource "scaleway_domain_record" "app" {
  dns_zone = scaleway_domain_zone.main.id
  name     = local.app_app.subdomain
  type     = "CNAME"
  data     = "${scaleway_container.app.domain_name}."
  ttl      = 3600
}

resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.domain_app
}


output "iam_role" {
  value = local.iam_role
}
output "project_id" {
  value = scaleway_account_project.main.id
}
output "domain" {
  value = local.env.domain
}
output "dns_zone" {
  value = scaleway_domain_zone.main.id
}
output "registry_endpoint" {
  value = scaleway_registry_namespace.main.endpoint
}
output "container_namespace_id" {
  value = scaleway_container_namespace.main.id
}
output "secret_id" {
  value = scaleway_secret.ci.id
}
