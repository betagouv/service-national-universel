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
  organization_id = "db949d19-5fe0-4def-a89b-f801aad2d050" # Selego
  ci_project_id = "1b29c5d9-9723-400a-aa8b-0c85ae3567f7"
}

# Project
resource "scaleway_account_project" "main" {
  name        = "snu-production"
  description = "SNU project for 'production'"
}

# Logs
resource "scaleway_cockpit" "main" {
  project_id = scaleway_account_project.main.id
}

# Registry
resource "scaleway_registry_namespace" "main" {
  project_id  = scaleway_account_project.main.id
  name        = "snu-production"
  description = "SNU registry for production"
  is_public   = false
}
data "scaleway_registry_image" "api" {
  name = "api"
  namespace_id = scaleway_registry_namespace.main.id
  project_id = scaleway_account_project.main.id
}

data "scaleway_registry_image" "admin" {
  name = "admin"
  namespace_id = scaleway_registry_namespace.main.id
  project_id = scaleway_account_project.main.id
}

data "scaleway_registry_image" "app" {
  name = "app"
  namespace_id = scaleway_registry_namespace.main.id
  project_id = scaleway_account_project.main.id
}

# Application user
resource "scaleway_iam_application" "main" {
  name        = "snu-deploy-production"
  description = "Application allowed to deploy apps in 'production'"
}

# Deploy policy
resource "scaleway_iam_policy" "deploy" {
  name           = "snu-deploy-production-policy"
  description    = "Allow to deploy apps in 'production'"
  application_id = scaleway_iam_application.main.id
  rule {
    project_ids = [scaleway_account_project.main.id]
    permission_set_names = [
      "ContainersFullAccess",
      "ContainerRegistryFullAccess",
      "DomainsDNSFullAccess",
      "SecretManagerReadOnly",
      "SecretManagerSecretAccess",
      "ObservabilityReadOnly",
    ]
  }
  rule {
    organization_id = local.organization_id
    permission_set_names = [
      "ProjectReadOnly",
      "IAMReadOnly"
    ]
  }
  rule {
    project_ids = [local.ci_project_id]
    permission_set_names = [
      "ContainerRegistryReadOnly",
    ]
  }
}


output "project_id" {
  value = scaleway_account_project.main.id
}
output "registry_endpoint" {
  value = scaleway_registry_namespace.main.endpoint
}
output "api_image_tags" {
  value = data.scaleway_registry_image.api.tags
}
output "admin_image_tags" {
  value = data.scaleway_registry_image.admin.tags
}
output "app_image_tags" {
  value = data.scaleway_registry_image.app.tags
}
