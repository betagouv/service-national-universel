terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"

  backend "pg" {
    schema_name = "project"
  }
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

locals {
  iam_role = "production"
  environments = toset(["production", "staging"])
}

# Project
resource scaleway_account_project main {
  name = "snu-${local.iam_role}"
  description = "SNU project for '${local.iam_role}'"
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

# Secrets
resource "scaleway_secret" "main" {
  for_each    = local.environments
  name        = "env-${each.key}"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment '${each.key}'"
}

# Containers namespace
resource scaleway_container_namespace main {
  for_each    = local.environments
  project_id = scaleway_account_project.main.id
  name        = "snu-${each.key}"
  description = "SNU container namespace for environment '${each.key}'"
}

# Application user
resource "scaleway_iam_application" "main" {
  name        = "snu-deploy-${local.iam_role}"
  description = "Application allowed to deploy apps in '${local.iam_role}'"
}

# Deploy policy
resource scaleway_iam_policy "deploy" {
  name = "snu-deploy-${local.iam_role}-policy"
  description = "Allow to deploy apps in '${local.iam_role}'"
  application_id = scaleway_iam_application.main.id
  rule {
    project_ids = [scaleway_account_project.main.id]
    permission_set_names = ["ContainersFullAccess", "ContainerRegistryFullAccess"]
  }
}

# Api key
resource "scaleway_iam_api_key" "main" {
  application_id = scaleway_iam_application.main.id
  description    = scaleway_iam_policy.deploy.description
}

output "iam_role" {
  value = local.iam_role
}
output "project_id" {
  value = scaleway_account_project.main.id
}
output "environments" {
  value = {for e in local.environments : e => {
    container_namespace_id = scaleway_container_namespace.main[e].id
    secret_id = scaleway_secret.main[e].id
  }}
}

output "registry_endpoint" {
  value = scaleway_registry_namespace.main.endpoint
}
