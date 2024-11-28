resource scaleway_job_definition anonymize_db {
  project_id  = scaleway_account_project.main.id
  name = "anonymize_db"
  description = "Dump source database, then reimport anonymized collections in destination database"
  cpu_limit = 2048
  memory_limit = 4096
  command = "./api/src/scripts/anonymization/docker/start_anonymize_db.sh"
  timeout = "2h"

  lifecycle {
    ignore_changes = [
      env,
      image_uri,
    ]
  }
}
