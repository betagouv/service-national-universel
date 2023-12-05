output "api_domain" {
  value = scaleway_container.api.domain_name
}
output "admin_domain" {
  value = scaleway_container.admin.domain_name
}
output "app_domain" {
  value = scaleway_container.app.domain_name
}
