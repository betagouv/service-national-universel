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
  iam_role    = "development"
  environment = "ci"
  domain      = "beta-snu.dev"
}

# Project
resource "scaleway_account_project" "main" {
  name        = "snu-${local.iam_role}"
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
  name        = "env-${local.environment}"
  project_id  = scaleway_account_project.main.id
  description = "Secrets for environment '${local.environment}'"
}

# Containers namespace
resource "scaleway_container_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-${local.environment}"
  description = "SNU container namespace for environment '${local.environment}'"
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
    permission_set_names = ["ContainersFullAccess", "ContainerRegistryFullAccess"]
  }
}

# DNS zone
resource "scaleway_domain_zone" "main" {
  domain     = local.domain
  subdomain  = local.environment
  project_id = scaleway_account_project.main.id
}

output "iam_role" {
  value = local.iam_role
}
output "project_id" {
  value = scaleway_account_project.main.id
}
output "domain" {
  value = scaleway_domain_zone.main.domain
}
output "dns_zone_id" {
  value = scaleway_domain_zone.main.id
}
output "registry_endpoint" {
  value = scaleway_registry_namespace.main.endpoint
}
output "container_namespace_id" {
  value = scaleway_container_namespace.main.id
}
output "secret_id" {
  value = scaleway_secret.main.id
}
