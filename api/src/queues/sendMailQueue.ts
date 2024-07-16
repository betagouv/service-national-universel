import config from "config";
import Queue from "bull";
import { capture } from "../sentry";
import { sendDocumentEmail, SendDocumentEmailOptions } from "../young/youngSendDocumentEmailService";

const MAIL_QUEUE = `${config.get("TASK_QUEUE_PREFIX")}_send_mail`;
const SEND_DOCUMENT_EMAIL = "send_document_mail";

class SendMailQueueService {
  queue = new Queue(MAIL_QUEUE, config.REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  sendDocumentEmailTask(options: SendDocumentEmailOptions) {
    console.log(`Add task ${SEND_DOCUMENT_EMAIL}`);
    return this.queue.add(SEND_DOCUMENT_EMAIL, options);
  }

  async startWorker() {
    return this.queue.process(SEND_DOCUMENT_EMAIL, async (job) => {
      try {
        console.log(`Start processing task ${SEND_DOCUMENT_EMAIL} (${job.id})`);
        const res = await sendDocumentEmail(job.data);
        console.log(`End processing task ${SEND_DOCUMENT_EMAIL} (${job.id})`);
        return res;
      } catch (err) {
        capture(err);
        throw err;
      }
    });
  }
}

const service = new SendMailQueueService();
export default service;
