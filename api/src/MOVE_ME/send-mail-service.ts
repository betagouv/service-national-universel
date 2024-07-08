const config = require("config");
const Queue = require("bull");
const { sendDocumentEmail } = require("./send-document-email");
const { capture } = require("../sentry");

class SendMailQueueService {
  queue = new Queue("send_mail", config.REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  async sendDocumentEmailTask(options) {
    const job = await this.queue.add("send_document_mail", options);
    console.log(`Add send_document_mail job : ${job.id}`);
    return job;
  }

  startWorker() {
    this.queue.process("send_document_mail", async (job) => {
      try {
        console.log(`Start processing send_document_mail job : ${job.id}`);
        console.log(job.data);
        const res = await sendDocumentEmail(job.data);
        console.log(`End processing send_document_mail job : ${job.id}`);
        return res;
      } catch (err) {
        capture(err);
        throw err;
      }
    });
  }
}

module.exports = new SendMailQueueService();
