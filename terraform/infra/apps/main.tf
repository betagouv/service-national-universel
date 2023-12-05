

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

module "apps" {
  source = "../../modules/scw_apps"

  container_namespace_id = data.terraform_remote_state.project.outputs.project.container_namespace_id
  secret_id = data.terraform_remote_state.project.outputs.project.secret_id
  environment = data.terraform_remote_state.project.outputs.project.environment
  image_tag = var.image_tag
  api_subdomain = var.api_subdomain
  admin_subdomain = var.admin_subdomain
  app_subdomain = var.app_subdomain
  dns_zone = var.dns_zone
  secret_revision = var.secret_revision
}
