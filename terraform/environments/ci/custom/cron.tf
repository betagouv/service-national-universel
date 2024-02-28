# Jobs
resource scaleway_job_definition cron {
  project_id  = data.scaleway_account_project.main.id
  name = "${local.env}-cron"
  cpu_limit = 140
  memory_limit = 512
  image_uri = "${data.scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  command = "npm run cron:start"
  cron_schedule" = "*/1 * * * *"

  env = {
    "ADMIN_URL"  = "https://${local.admin_hostname}"
    "APP_URL"    = "https://${local.app_hostname}"
    "CLE"        = "true"
    "STAGING"    = "true"
    "FOLDER_API" = "api"
    "SENTRY_PROFILE_SAMPLE_RATE"        = 0.8
    "SENTRY_TRACING_SAMPLE_RATE"        = 0.1
    "SENTRY_RELEASE"                    = var.api_image_tag
    "API_ANALYTICS_ENDPOINT"            = local.secrets.API_ANALYTICS_ENDPOINT
    "API_ASSOCIATION_AWS_ACCESS_KEY_ID" = local.secrets.API_ASSOCIATION_AWS_ACCESS_KEY_ID
    "API_ASSOCIATION_CELLAR_ENDPOINT"   = local.secrets.API_ASSOCIATION_CELLAR_ENDPOINT
    "API_ASSOCIATION_CELLAR_KEYID"      = local.secrets.API_ASSOCIATION_CELLAR_KEYID
    "API_PDF_ENDPOINT"                  = local.secrets.API_PDF_ENDPOINT
    "BUCKET_NAME"                       = local.secrets.BUCKET_NAME
    "CELLAR_ENDPOINT"                   = local.secrets.CELLAR_ENDPOINT
    "CELLAR_ENDPOINT_SUPPORT"           = local.secrets.CELLAR_ENDPOINT_SUPPORT
    "CELLAR_KEYID"                      = local.secrets.CELLAR_KEYID
    "CELLAR_KEYID_SUPPORT"              = local.secrets.CELLAR_KEYID_SUPPORT
    "DIAGORIENTE_URL"                   = local.secrets.DIAGORIENTE_URL
    "FRANCE_CONNECT_CLIENT_ID"          = local.secrets.FRANCE_CONNECT_CLIENT_ID
    "FRANCE_CONNECT_URL"                = local.secrets.FRANCE_CONNECT_URL
    "KNOWLEDGEBASE_URL"                 = local.secrets.KNOWLEDGEBASE_URL
    "PUBLIC_BUCKET_NAME"                = local.secrets.PUBLIC_BUCKET_NAME
    "PUBLIC_BUCKET_NAME_SUPPORT"        = local.secrets.PUBLIC_BUCKET_NAME_SUPPORT
    "SENTRY_URL"                        = local.secrets.SENTRY_URL
    "SUPPORT_URL"                       = local.secrets.SUPPORT_URL
    "API_ANALYTICS_API_KEY"                 = local.secrets.API_ANALYTICS_API_KEY
    "API_ASSOCIATION_AWS_SECRET_ACCESS_KEY" = local.secrets.API_ASSOCIATION_AWS_SECRET_ACCESS_KEY
    "API_ASSOCIATION_CELLAR_KEYSECRET"      = local.secrets.API_ASSOCIATION_CELLAR_KEYSECRET
    "API_ASSOCIATION_ES_ENDPOINT"           = local.secrets.API_ASSOCIATION_ES_ENDPOINT
    "CELLAR_KEYSECRET"                      = local.secrets.CELLAR_KEYSECRET
    "CELLAR_KEYSECRET_SUPPORT"              = local.secrets.CELLAR_KEYSECRET_SUPPORT
    "DIAGORIENTE_TOKEN"                     = local.secrets.DIAGORIENTE_TOKEN
    "ES_ENDPOINT"                           = local.secrets.ES_ENDPOINT
    "FILE_ENCRYPTION_SECRET"                = local.secrets.FILE_ENCRYPTION_SECRET
    "FILE_ENCRYPTION_SECRET_SUPPORT"        = local.secrets.FILE_ENCRYPTION_SECRET_SUPPORT
    "FRANCE_CONNECT_CLIENT_SECRET"          = local.secrets.FRANCE_CONNECT_CLIENT_SECRET
    "JVA_TOKEN"                             = local.secrets.JVA_TOKEN
    "MONGO_URL"                             = local.secrets.MONGO_URL
    "SECRET"                                = local.secrets.SECRET
    "SENDINBLUEKEY"                         = local.secrets.SENDINBLUEKEY
    "SUPPORT_APIKEY"                        = local.secrets.SUPPORT_APIKEY
    "PM2_SLACK_URL"                         = local.secrets.PM2_SLACK_URL
    "TOKENLOADTEST"                         = local.secrets.TOKENLOADTEST
  }
}
