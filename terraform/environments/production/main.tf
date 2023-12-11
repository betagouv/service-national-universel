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
  iam_role         = "production"
  env_keys = toset(["production", "staging"])
  envs     = { for k in local.env_keys : k => var.environments[k] }
  secrets          = { for k in local.env_keys : k => jsondecode(base64decode(data.scaleway_secret_version.main[k].data)) }
}

# Project
resource "scaleway_account_project" "main" {
  name        = "snu-${local.iam_role}"
  description = "SNU project for '${local.iam_role}'"
}

# Secrets
resource "scaleway_secret" "production" {
  name        = "snu-production"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment 'production'"
}

resource "scaleway_secret" "staging" {
  name        = "snu-staging"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment 'staging'"
}

data "scaleway_secret_version" "main" {
  for_each = local.envs

  secret_id = scaleway_secret[each.key].id
  revision  = each.value.secret_revision
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
      "ContainersFullAccess",
      "ContainerRegistryFullAccess",
      "DomainsDNSFullAccess",
      "SecretManagerReadOnly",
      "SecretManagerSecretAccess",
    ]
  }
}

# Containers namespace
resource "scaleway_container_namespace" "main" {
  for_each = local.envs

  project_id  = scaleway_account_project.main.id
  name        = "snu-${each.key}"
  description = "SNU container namespace for environment '${each.key}'"
}

# Containers
resource "scaleway_container" "api" {
  for_each = { for k in local.env_keys : k => {
    env    = var.environments[k]
    app    = var.environments[k].apps["api"]
    secret = local.secrets[k]
  } }

  name            = "${each.key}-${each.value.app.name}"
  namespace_id    = scaleway_container_namespace.main[each.key].id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${each.value.app.name}:${each.value.env.image_tag}"
  port            = 8080
  cpu_limit       = each.value.app.cpu_limit
  memory_limit    = each.value.app.memory_limit
  min_scale       = each.value.app.min_scale
  max_scale       = each.value.app.max_scale
  timeout         = each.value.app.timeout
  max_concurrency = each.value.app.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = each.value.app.name
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${each.value.env.apps.admin.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${each.value.env.apps.api.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${each.value.env.apps.app.subdomain}.${each.value.env.dns_zone}"
    "FOLDER_APP"                = each.value.app.name
  }, each.value.app.environment_variables)

  secret_environment_variables = {
    "API_ANALYTICS_ENDPOINT"                = each.value.secret.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID"     = each.value.secret.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"       = each.value.secret.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"          = each.value.secret.API_ASSOCIATION_CELLAR_KEYID
    "API_ASSOCIATION_ES_ENDPOINT"           = each.value.secret.API_ASSOCIATION_ES_ENDPOINT
    "API_PDF_ENDPOINT"                      = each.value.secret.API_PDF_ENDPOINT
    "BUCKET_NAME"                           = each.value.secret.BUCKET_NAME
    "CELLAR_ENDPOINT"                       = each.value.secret.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"               = each.value.secret.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                          = each.value.secret.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"                  = each.value.secret.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                       = each.value.secret.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"              = each.value.secret.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                    = each.value.secret.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                     = each.value.secret.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                    = each.value.secret.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"            = each.value.secret.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                            = each.value.secret.SENTRY_URL
    "SUPPORT_APIKEY"                        = each.value.secret.SUPPORT_APIKEY
    "SUPPORT_URL"                           = each.value.secret.SUPPORT_URL
    "API_ANALYTICS_API_KEY"                 = each.value.secret.API_ANALYTICS_API_KEY
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = each.value.secret.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = each.value.secret.API_ASSOCIATION_CELLAR_KEYSECRET
    "CELLAR_KEYSECRET"                      = each.value.secret.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = each.value.secret.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = each.value.secret.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = each.value.secret.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = each.value.secret.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = each.value.secret.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = each.value.secret.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_TOKEN"                             = each.value.secret.JVA_TOKEN
    "MONGO_URL"                             = each.value.secret.MONGO_URL
    "SECRET"                                = each.value.secret.SECRET
    "SENDINBLUEKEY"                         = each.value.secret.SENDINBLUEKEY
    "PM2_SLACK_URL"                         = each.value.secret.PM2_SLACK_URL
    "TOKENLOADTEST"                         = each.value.secret.TOKENLOADTEST
    "ZAMMAD_TOKEN"                          = each.value.secret.ZAMMAD_TOKEN
  }
}

resource "scaleway_container_domain" "api" {
  for_each = { for k in local.env_keys : k => {
    env = var.environments[k]
    app = var.environments[k].apps["api"]
  } }

  container_id = scaleway_container.api[each.key].id
  hostname     = "${each.value.app.subdomain}.${each.value.env.dns_zone}"
}



resource "scaleway_container" "admin" {
  for_each = { for k in local.env_keys : k => {
    env    = var.environments[k]
    app    = var.environments[k].apps["admin"]
    secret = local.secrets[k]
  } }

  name            = "${each.key}-${each.value.app.name}"
  namespace_id    = scaleway_container_namespace.main[each.key].id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${each.value.app.name}:${each.value.env.image_tag}"
  port            = 8080
  cpu_limit       = each.value.app.cpu_limit
  memory_limit    = each.value.app.memory_limit
  min_scale       = each.value.app.min_scale
  max_scale       = each.value.app.max_scale
  timeout         = each.value.app.timeout
  max_concurrency = each.value.app.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = each.value.app.name
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${each.value.env.apps.admin.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${each.value.env.apps.api.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${each.value.env.apps.app.subdomain}.${each.value.env.dns_zone}"
  }, each.value.app.environment_variables)

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"            = each.value.secret.SENTRY_URL
    "SENTRY_AUTH_TOKEN"                     = each.value.secret.SENTRY_AUTH_TOKEN
    "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = each.value.secret.USERBACK_ACCESS_TOKEN
  }
}

resource "scaleway_container_domain" "admin" {
  for_each = { for k in local.env_keys : k => {
    env = var.environments[k]
    app = var.environments[k].apps["admin"]
  } }

  container_id = scaleway_container.admin[each.key].id
  hostname     = "${each.value.app.subdomain}.${each.value.env.dns_zone}"
}

resource "scaleway_container" "app" {
  for_each = { for k in local.env_keys : k => {
    env    = var.environments[k]
    app    = var.environments[k].apps["app"]
    secret = local.secrets[k]
  } }

  name            = "${each.key}-${each.value.app.name}"
  namespace_id    = scaleway_container_namespace.main[each.key].id
  registry_image  = "${scaleway_registry_namespace.main.endpoint}/${each.value.app.name}:${each.value.env.image_tag}"
  port            = 8080
  cpu_limit       = each.value.app.cpu_limit
  memory_limit    = each.value.app.memory_limit
  min_scale       = each.value.app.min_scale
  max_scale       = each.value.app.max_scale
  timeout         = each.value.app.timeout
  max_concurrency = each.value.app.max_concurrency
  privacy         = "public"
  protocol        = "http1"
  deploy          = true

  environment_variables = merge({
    "APP_NAME"                  = each.value.app.name
    "DOCKER_ENV_VITE_ADMIN_URL" = "https://${each.value.env.apps.admin.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_API_URL"   = "https://${each.value.env.apps.api.subdomain}.${each.value.env.dns_zone}"
    "DOCKER_ENV_VITE_APP_URL"   = "https://${each.value.env.apps.app.subdomain}.${each.value.env.dns_zone}"
    "FOLDER_APP"                = each.value.app.name
  }, each.value.app.environment_variables)

  secret_environment_variables = {
    "DOCKER_ENV_VITE_SENTRY_URL"        = each.value.secret.SENTRY_URL
    "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = each.value.secret.SENTRY_AUTH_TOKEN
  }
}

resource "scaleway_container_domain" "app" {
  for_each = { for k in local.env_keys : k => {
    env = var.environments[k]
    app = var.environments[k].apps["app"]
  } }

  container_id = scaleway_container.app[each.key].id
  hostname     = "${each.value.app.subdomain}.${each.value.env.dns_zone}"
}
