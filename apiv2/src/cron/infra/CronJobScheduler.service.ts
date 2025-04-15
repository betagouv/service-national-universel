import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";
import { QueueName } from "@shared/infra/Queue";
import { cronJobs } from "../jobs.config";
import { InjectQueue } from "@nestjs/bullmq";

@Injectable()
export class CronJobSchedulerService implements OnModuleInit {
    private readonly logger: Logger = new Logger(CronJobSchedulerService.name);
    constructor(@InjectQueue(QueueName.CRON) private jobQueue: Queue) {}

    async onModuleInit() {
        await this.scheduleJobs();
    }

    private async scheduleJobs() {
        const repeatableJobs = await this.jobQueue.getJobSchedulers();
        for (const job of repeatableJobs) {
            await this.jobQueue.removeJobScheduler(job.name);
        }

        for (const job of cronJobs) {
            this.logger.log(`Adding job ${job.name} with pattern ${job.pattern}`);
            await this.jobQueue.upsertJobScheduler(
                job.name,
                { pattern: job.pattern },
                {
                    name: job.name,
                    data: job.data,
                    opts: {
                        ...job.opts,
                    },
                },
            );
        }
    }
}
