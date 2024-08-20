import config from "config";
import { Worker, Queue, Job } from "bullmq";
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
  for (const cron of CRONS) {
    // @ts-ignore
    const job = await queue.add(
      cron.name,
      {},
      {
        repeat: {
          pattern: cron.crontab,
        },
        jobId: cron.name,
      },
    );
    logAddedTask(job);
  }
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
        checkin_margin: 10,
        max_runtime: 15,
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
