import config from "config";
import { Worker, Queue } from "bullmq";
import { capture } from "../sentry";
import { sendDocumentEmail, SendDocumentEmailOptions } from "../young/youngSendDocumentEmailService";

const MAIL_QUEUE = `${config.get("TASK_QUEUE_PREFIX")}_send_mail`;
const SEND_DOCUMENT_EMAIL = "send_document_mail";

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
    },
    connection,
  });
  return queue;
}

export function sendDocumentEmailTask(options: SendDocumentEmailOptions) {
  console.log(`Add task ${SEND_DOCUMENT_EMAIL}`);
  return queue?.add(SEND_DOCUMENT_EMAIL, options);
}

export function initWorker(connection) {
  worker = new Worker(
    MAIL_QUEUE,
    async (job) => {
      console.log(`Start processing task ${job.name} (${job.id})`);
      try {
        switch (job.name) {
          case SEND_DOCUMENT_EMAIL: {
            await sendDocumentEmail(job.data);
            break;
          }
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
