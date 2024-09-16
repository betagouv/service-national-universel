import config from "config";
import { logger } from "../logger";
import { Worker, Queue, Job, RepeatableJob } from "bullmq";
import { capture, captureMessage } from "../sentry";
import CRONS from "../crons";

import { captureCheckIn } from "@sentry/node";
import { MonitorConfig } from "@sentry/types";
import { logAddedTask, logStartedTask, logSucceedTask, logFailedTask } from "./taskLoggerService";

const CRONS_QUEUE = `${config.get("TASK_QUEUE_PREFIX")}_crons`;

let queue: Queue | null = null;
let worker: Worker | null = null;

export function initQueue(connection) {
  queue = new Queue(CRONS_QUEUE, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
    connection,
  });
  return queue;
}

export async function scheduleCrons() {
  // @ts-ignore
  const jobs = await queue.getRepeatableJobs();
  const unchangedJobs: RepeatableJob[] = [];
  const outdatedJobs: RepeatableJob[] = [];

  for (const job of jobs) {
    if (CRONS.find((cron) => cron.name === job.name && cron.crontab === job.pattern)) {
      unchangedJobs.push(job);
    } else {
      // cron deleted or updated in code
      outdatedJobs.push(job);
    }
  }

  // Remove outdated Jobs :
  // - cron not declared in CRONS with existing RepeatableJob (deleted)
  // - cron declared in CRONS with existing RepeatableJob but different name & crontab (updated)
  await Promise.all(
    outdatedJobs.map((job) => {
      logger.info(`Deleting outdated cron ${job.name} (${job.pattern})`);
      // @ts-ignore
      return queue.removeRepeatableByKey(job.key);
    }),
  );

  // Add new Jobs :
  // - cron declared in CRONS with no existing RepeatableJob
  const newCrons = CRONS.filter((cron) => !unchangedJobs.some((job) => job.name === cron.name));
  await Promise.all(
    newCrons.map((cron) => {
      logger.info(`Adding new cron ${cron.name} (${cron.crontab})`);
      // @ts-ignore
      return queue.add(
        cron.name,
        {},
        {
          repeat: {
            pattern: cron.crontab,
          },
          jobId: cron.name,
        },
      );
    }),
  );
}

export function initWorker(connection) {
  worker = new Worker(
    CRONS_QUEUE,
    async (job) => {
      const cron = CRONS.find((c) => c.name === job.name);
      if (!cron) {
        throw new Error("CRON not found");
      }
      logStartedTask(job);
      const monitorConfig = {
        schedule: {
          type: "crontab",
          value: cron.crontab,
        },
        timezone: "Etc/UTC",
        checkinMargin: 10,
        maxRuntime: 15,
      } as MonitorConfig;
      const checkInId = captureCheckIn(
        {
          monitorSlug: cron.name,
          status: "in_progress",
        },
        monitorConfig,
      );
      try {
        await Promise.all(cron.handlers.map((h) => h.call()));
        captureCheckIn(
          {
            checkInId,
            monitorSlug: cron.name,
            status: "ok",
          },
          monitorConfig,
        );
      } catch (err) {
        captureCheckIn(
          {
            checkInId,
            monitorSlug: cron.name,
            status: "error",
          },
          monitorConfig,
        );
        throw err;
      }
    },
    { connection },
  );
  worker.on("completed", (job) => {
    logSucceedTask(job);
  });

  worker.on("failed", (job: Job, error) => {
    const error_id = capture(error);
    logFailedTask(job, error_id);
  });
  worker.on("error", (err) => captureMessage(err));
  return worker;
}
