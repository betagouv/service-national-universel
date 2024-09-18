
resource scaleway_job_definition reindex_es {
  project_id  = scaleway_account_project.main.id
  name = "reindex_es"
  description = "Reindex models in Elasticsearch"
  cpu_limit = 2048
  memory_limit = 4096
  image_uri = "${scaleway_registry_namespace.main.endpoint}/api:${var.api_image_tag}"
  command = "./api/src/scripts/reindex_es_all_models/docker/start_reindex_db.sh"
  timeout = "2h"

  env = {
    "SCW_PROJECT_ID" = scaleway_account_project.main.id
    "SCW_SECRET_KEY" = local.secrets.SCW_SECRET_KEY
    "GROUP_NAME" = "useful"
    "NODE_ENV" = "ci"
  }
}