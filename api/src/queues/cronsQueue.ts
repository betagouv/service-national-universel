import config from "config";
import { Worker, Queue } from "bullmq";
import { capture } from "../sentry";
import CRONS from "../crons";

import { captureCheckIn } from "@sentry/node";
import { MonitorConfig } from "@sentry/types";

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

export function scheduleCrons() {
  for (const cron of CRONS) {
    console.log(`Schedule task ${cron.name}`);
    queue?.add(
      cron.name,
      {},
      {
        repeat: {
          pattern: cron.crontab,
        },
        jobId: cron.name,
      },
    );
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
      console.log(`Start processing task ${job.name} (${job.id})`);
      const monitorConfig = {
        schedule: {
          type: "crontab",
          value: cron.crontab,
        },
        timezone: "Etc/UTC",
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
        console.log(`End processing task ${job.name} (${job.id})`);
      } catch (err) {
        capture(err);
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
  worker.on("error", (err) => console.error(err));
  return worker;
}
