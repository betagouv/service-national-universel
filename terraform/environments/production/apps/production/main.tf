variable "image_tag" {
  type    = string
  default = "latest"
}

terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {
    schema_name = "apps"
  }
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

data "terraform_remote_state" "project" {
  backend = "pg"

  config = {
    schema_name = "project"
  }
}

locals {
  environment = "production"
  project = data.terraform_remote_state.project.outputs.environments[local.environment]
  registry_endpoint = data.terraform_remote_state.project.outputs.registry_endpoint
  secrets = jsondecode(base64decode(data.scaleway_secret_version.main.data))
  api_subdomain = "test-api"
  admin_subdomain = "test-admin"
  app_subdomain = "test-app"
  dns_zone = "beta-snu.dev"
  api_app_name = "api"
  admin_app_name = "admin"
  app_app_name = "app"
  app_domain = "${local.app_subdomain}.${local.dns_zone}"
  api_domain = "${local.api_subdomain}.${local.dns_zone}"
  admin_domain = "${local.admin_subdomain}.${local.dns_zone}"
}

data "scaleway_secret_version" main {
  secret_id = local.project.secret_id
  revision = 1
}

data "scaleway_container_namespace" main {
  namespace_id = local.project.container_namespace_id
}

resource scaleway_container api {
    name = "${local.environment}-${local.api_app_name}"
    namespace_id = data.scaleway_container_namespace.main.id
    registry_image = "${local.registry_endpoint}/${local.api_app_name}:${var.image_tag}"
    port = 8080
    cpu_limit = 768
    memory_limit = 1024
    min_scale = 1
    max_scale = 20
    timeout = 60
    max_concurrency = 30
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
      "ADMIN_URL" = "https://${local.admin_domain}"
      "APP_URL" = "https://${local.app_domain}"
      "APP_NAME" = local.api_app_name
      "STAGING" = "true"
      "API_ANALYTICS_ENDPOINT" = local.secrets.API_ANALYTICS_ENDPOINT
      "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
      "API_ASSOCIATION_CELLAR_ENDPOINT" = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
      "API_ASSOCIATION_CELLAR_KEYID" = local.secrets.API_ASSOCIATION_CELLAR_KEYID
      "API_ASSOCIATION_ES_ENDPOINT" = local.secrets.API_ASSOCIATION_ES_ENDPOINT
      "API_PDF_ENDPOINT" = local.secrets.API_PDF_ENDPOINT
      "BUCKET_NAME" = local.secrets.BUCKET_NAME
      "CC_CLAMAV" = "true"
      "CELLAR_ENDPOINT" = local.secrets.CELLAR_ENDPOINT
      "CELLAR_ENDPOINT_SUPPORT" = local.secrets.CELLAR_ENDPOINT_SUPPORT
      "CELLAR_KEYID" = local.secrets.CELLAR_KEYID
      "CELLAR_KEYID_SUPPORT" = local.secrets.CELLAR_KEYID_SUPPORT
      "DIAGORIENTE_URL" = local.secrets.DIAGORIENTE_URL
      "FRANCE_CONNECT_CLIENT_ID" = local.secrets.FRANCE_CONNECT_CLIENT_ID
      "FRANCE_CONNECT_URL" = local.secrets.FRANCE_CONNECT_URL
      "KNOWLEDGEBASE_URL" = local.secrets.KNOWLEDGEBASE_URL
      "PUBLIC_BUCKET_NAME" = local.secrets.PUBLIC_BUCKET_NAME
      "PUBLIC_BUCKET_NAME_SUPPORT" = local.secrets.PUBLIC_BUCKET_NAME_SUPPORT
      "SENTRY_PROFILE_SAMPLE_RATE" = "0.8"
      "SENTRY_TRACING_SAMPLE_RATE" = "0.1"
      "SENTRY_URL" = local.secrets.SENTRY_URL
      "SUPPORT_APIKEY" = local.secrets.SUPPORT_APIKEY
      "SUPPORT_URL" = local.secrets.SUPPORT_URL
    }

    secret_environment_variables = {
      "API_ANALYTICS_API_KEY" = local.secrets.API_ANALYTICS_API_KEY
      "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
      "API_ASSOCIATION_CELLAR_KEYSECRET" = local.secrets.API_ASSOCIATION_CELLAR_KEYSECRET
      "CELLAR_KEYSECRET" = local.secrets.CELLAR_KEYSECRET
      "CELLAR_KEYSECRET_SUPPORT" = local.secrets.CELLAR_KEYSECRET_SUPPORT
      "DIAGORIENTE_TOKEN" = local.secrets.DIAGORIENTE_TOKEN
      "ES_ENDPOINT" = local.secrets.ES_ENDPOINT
      "FILE_ENCRYPTION_SECRET" = local.secrets.FILE_ENCRYPTION_SECRET
      "FILE_ENCRYPTION_SECRET_SUPPORT" = local.secrets.FILE_ENCRYPTION_SECRET_SUPPORT
      "FRANCE_CONNECT_CLIENT_SECRET" = local.secrets.FRANCE_CONNECT_CLIENT_SECRET
      "JVA_TOKEN" = local.secrets.JVA_TOKEN
      "MONGO_URL" = local.secrets.MONGO_URL
      "SECRET" = local.secrets.SECRET
      "SENDINBLUEKEY" = local.secrets.SENDINBLUEKEY
      "PM2_SLACK_URL" = local.secrets.PM2_SLACK_URL
      "TOKENLOADTEST" = local.secrets.TOKENLOADTEST
      "ZAMMAD_TOKEN" = local.secrets.ZAMMAD_TOKEN
    }
}

resource scaleway_container_domain api {
  container_id = scaleway_container.api.id
  hostname = local.api_domain
}

resource scaleway_container admin {
    name = "${local.environment}-${local.admin_app_name}"
    namespace_id = data.scaleway_container_namespace.main.id
    registry_image = "${local.registry_endpoint}/${local.admin_app_name}:${var.image_tag}"
    port = 8080
    cpu_limit = 256
    memory_limit = 256
    min_scale = 1
    max_scale = 5
    timeout = 60
    max_concurrency = 80
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
        "APP_NAME" = local.admin_app_name
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${local.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${local.app_domain}"
        "DOCKER_ENV_VITE_MAINTENANCE" = "false"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_USERBACK_ACCESS_TOKEN" = local.secrets.USERBACK_ACCESS_TOKEN
      "SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
    }
}

resource scaleway_container_domain admin {
  container_id = scaleway_container.admin.id
  hostname = local.admin_domain
}

resource scaleway_container app {
    name = "${local.environment}-${local.app_app_name}"
    namespace_id = data.scaleway_container_namespace.main.id
    registry_image = "${local.registry_endpoint}/${local.app_app_name}:${var.image_tag}"
    port = 8080
    cpu_limit = 256
    memory_limit = 256
    min_scale = 1
    max_scale = 5
    timeout = 60
    max_concurrency = 80
    privacy = "public"
    protocol = "http1"
    deploy = true

    environment_variables = {
        "APP_NAME" = local.app_app_name
        "CLE" = "true"
        "DOCKER_ENV_VITE_ADMIN_URL" = "https://${local.admin_domain}"
        "DOCKER_ENV_VITE_API_URL" = "https://${local.api_domain}"
        "DOCKER_ENV_VITE_APP_URL" = "https://${local.app_domain}"
        "DOCKER_ENV_VITE_SENTRY_SESSION_SAMPLE_RATE" = "0.1"
        "DOCKER_ENV_VITE_SENTRY_URL" = local.secrets.SENTRY_URL
        "DOCKER_ENV_VITE_SUPPORT_URL" = "https://support.beta-snu.dev"
        "FOLDER_APP" = local.app_app_name
        "STAGING" = "true"
    }

    secret_environment_variables = {
      "DOCKER_ENV_VITE_SENTRY_AUTH_TOKEN" = local.secrets.SENTRY_AUTH_TOKEN
    }
}

resource scaleway_container_domain app {
  container_id = scaleway_container.app.id
  hostname = local.app_domain
}
