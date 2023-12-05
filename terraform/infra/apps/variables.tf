variable "image_tag" {
  type     = string
  nullable = false
}

variable "api_subdomain" {
  type     = string
  nullable = false
}

variable "admin_subdomain" {
  type     = string
  nullable = false
}

variable "app_subdomain" {
  type     = string
  nullable = false
}

variable "dns_zone" {
  type     = string
  nullable = false
}
