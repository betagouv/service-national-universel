import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { Job } from "bullmq";
import { TaskName } from "snu-lib";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        private adminTaskRepository: AdminTaskRepository,
    ) {
        super();
    }
    // TODO call async usecase task
    async process(job: Job<TaskQueue, any, TaskName>): Promise<ConsumerResponse> {
        this.logger.log(`Processing task "${job.name}" with data ${JSON.stringify(job.data)}`, AdminTaskConsumer.name);
        await this.adminTaskRepository.toSuccess(job.data.id);
        return ConsumerResponse.SUCCESS;
        // return this.taskProvider
        //     .execute(job.name, job.data)
        //     .then(() => {
        //         this.logger.log(
        //             `Task "${job.name}" processed successfully with data ${JSON.stringify(job.data)}`,
        //             AdminTaskConsumer.name,
        //         );
        //         return ConsumerResponse.SUCCESS;
        //     })
        //     .catch((error) => {
        //         this.logger.error(
        //             `Error processing task "${job.name}" - ${error.message} - ${error.stack}`,
        //             AdminTaskConsumer.name,
        //         );
        //         throw error;
        //     });
    }
}
