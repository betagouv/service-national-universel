
terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"
}

resource "random_password" "main" {
  length  = 32
  special = true
}

resource "scaleway_rdb_database" "main" {
  instance_id    = var.rdb_instance_id
  name           = "terraform-backend-${var.user_role}"
}

resource "scaleway_rdb_user" "main" {
  instance_id = var.rdb_instance_id
  name        = "snu-${var.user_role}"
  password    = random_password.main.result
  is_admin    = false
}

resource "scaleway_rdb_privilege" "main" {
  instance_id   = var.rdb_instance_id
  user_name     = scaleway_rdb_user.main.name
  database_name = scaleway_rdb_database.main.name
  permission    = "all"
}
