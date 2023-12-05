output "environment" {
  value = var.environment
}
output "project_id" {
  value = scaleway_account_project.main.id
}
output "container_namespace_id" {
  value = scaleway_container_namespace.main.id
}
output "secret_id" {
  value = scaleway_secret.main.id
}
output "registry_endpoint" {
  value = scaleway_container_namespace.main.registry_endpoint
}
