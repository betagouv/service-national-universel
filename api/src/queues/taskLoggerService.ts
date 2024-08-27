const { logger } = require("../logger");
import { Job } from "bullmq";

function _log(job: Job, opts: any) {
  const log = {
    queue: job.queueName,
    name: job.name,
    id: job.id,
    data: job.data,
    addedOn: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    attempts: job.attemptsStarted,
    ...opts,
  };
  logger.info("tasks", log);
}

export const logAddedTask = (job: Job) => _log(job, { type: "added" });
export const logStartedTask = (job: Job) => _log(job, { type: "started" });
export const logSucceedTask = (job: Job) => _log(job, { type: "succeed" });
export const logFailedTask = (job: Job, error_id: string) => _log(job, { type: "failed", error_id });
