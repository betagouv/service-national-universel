
locals {
  domain             = "snu.gouv.fr"
  api_hostname       = "api.${local.domain}"
  apiv2_hostname    = "apiv2.${local.domain}"
  admin_hostname     = "admin.${local.domain}"
  app_hostname       = "moncompte.${local.domain}"
  antivirus_hostname = "antivirus.beta-snu.dev"
}

# Secrets
resource "scaleway_secret" "production" {
  name        = "snu-production"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment 'production'"
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
  port            = 8080
  cpu_limit       = 1024
  memory_limit    = 2048
  min_scale       = 0
  max_scale       = 20
  timeout         = 60
  max_concurrency = 25
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"
  sandbox         = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}



resource "scaleway_container" "admin" {
  name            = "production-admin"
  namespace_id    = scaleway_container_namespace.production.id
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 0
  max_scale       = 20
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "app" {
  name            = "production-app"
  namespace_id    = scaleway_container_namespace.production.id
  port            = 8080
  cpu_limit       = 256
  memory_limit    = 256
  min_scale       = 0
  max_scale       = 20
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "antivirus" {
  name            = "production-antivirus"
  namespace_id    = scaleway_container_namespace.production.id
  port            = 8089
  cpu_limit       = 1024
  memory_limit    = 4096
  min_scale       = 0
  max_scale       = 5
  timeout         = 60
  max_concurrency = 50
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "tasks" {
  name           = "production-tasks"
  namespace_id   = scaleway_container_namespace.production.id
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 2048
  min_scale      = 0
  max_scale      = 1
  privacy        = "public"
  protocol       = "http1"
  deploy         = true
  http_option    = "redirected"
  sandbox        = "v1"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "apiv2" {
  name            = "production-apiv2"
  namespace_id    = scaleway_container_namespace.production.id
  port            = 8080
  cpu_limit       = 1024
  memory_limit    = 2048
  min_scale       = 0
  max_scale       = 1
  timeout         = 60
  max_concurrency = 25
  privacy         = "public"
  protocol        = "http1"
  deploy          = true
  http_option     = "redirected"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}

resource "scaleway_container" "tasksv2" {
  name           = "production-tasksv2"
  namespace_id   = scaleway_container_namespace.production.id
  port           = 8080
  cpu_limit      = 1024
  memory_limit   = 2048
  min_scale      = 0
  max_scale      = 1
  privacy        = "public"
  protocol       = "http1"
  deploy         = true
  http_option    = "redirected"

  lifecycle {
    ignore_changes = [
      registry_image,
      environment_variables,
      secret_environment_variables,
    ]
  }
}


resource "scaleway_container_domain" "api" {
  container_id = scaleway_container.api.id
  hostname     = local.api_hostname
}
resource "scaleway_container_domain" "admin" {
  container_id = scaleway_container.admin.id
  hostname     = local.admin_hostname
}
resource "scaleway_container_domain" "app" {
  container_id = scaleway_container.app.id
  hostname     = local.app_hostname
}
resource "scaleway_container_domain" "antivirus" {
  container_id = scaleway_container.antivirus.id
  hostname     = local.antivirus_hostname
}
# resource "scaleway_container_domain" "apiv2" {
#  container_id = scaleway_container.apiv2.id
#  hostname     = local.api_hostname
# }
