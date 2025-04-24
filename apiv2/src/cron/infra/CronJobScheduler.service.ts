import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";
import { QueueName } from "@shared/infra/Queue";
import { cronJobs, CronJobName } from "../jobs.config";
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
        const cronJobNames = cronJobs.map((job) => job.name);
        this.logger.log(`Number of repeatable jobs in ${QueueName.CRON} queue: ${repeatableJobs.length}`);
        this.logger.log(`Number of cron jobs in configuration: ${cronJobs.length}`);

        for (const job of repeatableJobs) {
            if (!cronJobNames.includes(job.name as CronJobName)) {
                this.logger.log(`Removing job ${job.name} with key ${job.key} as it's no longer in the configuration`);
                await this.jobQueue.removeJobScheduler(job.name);
            }
        }

        for (const job of cronJobs) {
            this.logger.log(`Adding/updating job ${job.name} with pattern ${job.pattern}`);
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
        const repeatableJobsAfterUpsertion = await this.jobQueue.getJobSchedulers();
        this.logger.log(
            `List of repeatable jobs in ${
                QueueName.CRON
            } queue after removal and upsertion: "${repeatableJobsAfterUpsertion.map((job) => job.name).join(", ")}"`,
        );
    }
}
