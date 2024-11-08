import config from "config";
import { Worker, Queue, Job } from "bullmq";
import { capture, captureMessage } from "../sentry";
import { sendDocumentEmail, SendDocumentEmailOptions } from "../young/youngSendDocumentEmailService";
import { logAddedTask, logStartedTask, logSucceedTask, logFailedTask } from "./taskLoggerService";

const MAIL_QUEUE = `${config.get("TASK_QUEUE_PREFIX")}_send_mail`;
const SEND_DOCUMENT_EMAIL = "send_document_mail";
const CONCURRENCY = 5;

let queue: Queue | null = null;
let worker: Worker | null = null;

export function initQueue(connection) {
  queue = new Queue(MAIL_QUEUE, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: {
        age: 7 * 24 * 3600, // 1 week
      },
      removeOnFail: {
        age: 30 * 24 * 3600, // 1 month
      },
    },
    connection,
  });
  return queue;
}

export async function sendDocumentEmailTask(options: SendDocumentEmailOptions) {
  // @ts-ignore
  const job = await queue.add(SEND_DOCUMENT_EMAIL, options);
  logAddedTask(job);
  return job;
}

export function initWorker(connection) {
  worker = new Worker(
    MAIL_QUEUE,
    async (job) => {
      logStartedTask(job);
      switch (job.name) {
        case SEND_DOCUMENT_EMAIL: {
          await sendDocumentEmail(job.data);
          break;
        }
      }
    },
    { connection, concurrency: CONCURRENCY },
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
