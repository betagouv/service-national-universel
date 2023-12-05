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

module "project" {
  source = "../../modules/scw_project"

  environment = var.environment
}
