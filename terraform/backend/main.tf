variable "project_id" {
  type = string
  default = "db949d19-5fe0-4def-a89b-f801aad2d050" # default
  description = "Default project_id"
}

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
  project_id = var.project_id
}

resource "random_password" "admin_password" {
  length  = 32
  special = true
}

resource scaleway_rdb_instance main {
    name = "snu-terraform-backend"
    node_type = "db-dev-s"
    engine = "PostgreSQL-15"
    is_ha_cluster = false
    disable_backup = true
    user_name = "snu-admin"
    password = random_password.admin_password.result
    tags = [ "snu", "terraform" ]
}

resource "scaleway_rdb_database" "terraform_backend" {
  name        = "terraform-backend"
  instance_id = scaleway_rdb_instance.main.id
}

resource "scaleway_rdb_privilege" "terraform_backend" {
  instance_id   = scaleway_rdb_instance.main.id
  user_name     = scaleway_rdb_instance.main.user_name
  database_name = scaleway_rdb_database.terraform_backend.name
  permission    = "all"
}

output "admin_password" {
  sensitive = true
  value = random_password.admin_password.result
}

# env test
resource "random_password" "test_password" {
  length  = 32
  special = true
}

resource "scaleway_rdb_database" "terraform_backend_test" {
  instance_id    = scaleway_rdb_instance.main.id
  name           = "terraform-backend-test"
}

resource "scaleway_rdb_user" "terraform_backend_test" {
  instance_id = scaleway_rdb_instance.main.id
  name        = "snu-test"
  password    = random_password.test_password.result
  is_admin    = false
}

resource "scaleway_rdb_privilege" "terraform_backend_test" {
  instance_id   = scaleway_rdb_instance.main.id
  user_name     = scaleway_rdb_user.terraform_backend_test.name
  database_name = scaleway_rdb_database.terraform_backend_test.name
  permission    = "all"
}

output "test_password" {
  sensitive = true
  value = random_password.test_password.result
}
