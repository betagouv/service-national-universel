resource scaleway_job_definition anonymize_db {
  project_id  = scaleway_account_project.main.id
  name = "anonymize_db"
  description = "Dump source database, then reimport anonymized collections in destination database"
  cpu_limit = 2048
  memory_limit = 4096
  image_uri = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  command = "./api/src/scripts/anonymization/docker/start_anonymize_db.sh"
  timeout = "2h"

  env = {
    "SCW_PROJECT_ID" = scaleway_account_project.main.id
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
  }
}

resource scaleway_job_definition reindex_es {
  project_id  = scaleway_account_project.main.id
  name = "reindex_es"
  description = "Reindex models in Elasticsearch"
  cpu_limit = 2048
  memory_limit = 4096
  image_uri = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  command = "./api/src/scripts/reindex_es_all_models/docker/start_reindex_es.sh"
  timeout = "2h"

  env = {
    "SCW_PROJECT_ID" = scaleway_account_project.main.id
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
    "GROUP_NAME" = "none"
    "NODE_ENV" = "production"
  }
}
