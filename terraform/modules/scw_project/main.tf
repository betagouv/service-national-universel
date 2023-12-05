
terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
}

# Project
resource scaleway_account_project main {
  name = "snu-${var.environment}"
  description = "Snu project for environment '${var.environment}'"
}

# Logs
resource "scaleway_cockpit" "main" {
  project_id = scaleway_account_project.main.id
}

# Secrets
resource "scaleway_secret" "main" {
  name        = "env-${var.environment}"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment '${var.environment}'"
}

# Containers namespace
resource scaleway_container_namespace main {
  project_id = scaleway_account_project.main.id
  name        = "snu-${var.environment}"
  description = "SNU container namespace for environment ${var.environment}"
}
