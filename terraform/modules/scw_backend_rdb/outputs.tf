output "db_name" {
  value = scaleway_rdb_database.main.name
}

output "user_name" {
  value = scaleway_rdb_user.main.name
}

output "user_password" {
  sensitive = true
  value = random_password.main.result
}
