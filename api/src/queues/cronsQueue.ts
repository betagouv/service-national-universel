import config from "config";
import { Worker, Queue } from "bullmq";
import { capture } from "../sentry";
import CRONS from "../crons";

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
    return queue?.add(
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
      console.log(`Start processing task ${job.name} (${job.id})`);
      try {
        const cron = CRONS.find((c) => c.name === job.name);
        if (cron) {
          cron.handler();
        }
        console.log(`End processing task ${job.name} (${job.id})`);
      } catch (err) {
        capture(err);
        throw err;
      }
    },
    { connection },
  );
  worker.on("error", (err) => console.error(err));
  return worker;
}
