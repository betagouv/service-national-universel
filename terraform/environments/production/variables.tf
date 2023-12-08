variable "project_id" {
  type     = string
  nullable = false
}
variable "environments" {
  type = map(object({
    name      = string
    dns_zone  = string
    secret_id = string
    revision  = number
    image_tag = string
    apps = map(object({
      name                  = string
      subdomain             = string
      cpu_limit             = optional(number, 256)
      memory_limit          = optional(number, 256)
      min_scale             = optional(number, 1)
      max_scale             = optional(number, 1)
      timeout               = optional(number, 60)
      max_concurrency       = optional(number, 50)
      environment_variables = optional(map(string), {})
    }))
  }))
  nullable = false
}
