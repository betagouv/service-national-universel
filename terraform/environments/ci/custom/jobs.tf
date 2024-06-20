resource scaleway_job_definition main {
  project_id  = local.project_id
  name = "anonymize_db"
  description = "Dump source database, then reimport anonymized collections in destination database"
  cpu_limit = 2048
  memory_limit = 4096
  image_uri = "${data.scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  command = "./api/src/scripts/anonymization/docker/start_anonymize_db.sh"
  timeout = "2h"

  env = {
    "NODE_ENV"       = "staging"
    "SCW_PROJECT_ID" = local.secrets.SCW_PROJECT_ID_TASK
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY_TASK
  }
}
