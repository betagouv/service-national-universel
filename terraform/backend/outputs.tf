output "production" {
  sensitive = true
  value = module.production
}

output "dev" {
  sensitive = true
  value = module.dev
}
