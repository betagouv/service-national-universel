import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { CronJob, CronJobName } from "../jobs.config";
import { CronJobSelectorService } from "./CronJobSelector.service";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName } from "@shared/infra/Queue";
import { Processor, WorkerHost } from "@nestjs/bullmq";

@Processor(QueueName.CRON)
export class CronJobConsumer extends WorkerHost {
    private readonly logger: Logger = new Logger(CronJobConsumer.name);
    constructor(private readonly cronJobSelector: CronJobSelectorService) {
        super();
    }

    async process(job: Job<CronJob, any, CronJobName>): Promise<ConsumerResponse> {
        this.logger.log(`Processing cron job ${job.name}`);
        try {
            await this.cronJobSelector.handleCronJob(job);
            this.logger.log(`Cron job ${job.name} processed successfully`);
            return ConsumerResponse.SUCCESS;
        } catch (error) {
            this.logger.error(`Error processing cron job ${job.name}: ${error}`);
            return ConsumerResponse.FAILURE;
        }
    }
}
