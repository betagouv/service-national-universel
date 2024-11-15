import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { Job } from "bullmq";
import { TaskName } from "snu-lib";
import { QueueType, TaskQueue } from "../Queue";

@Processor(QueueType.TASK)
export class TaskConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        // @Inject(TaskProvider) private readonly taskProvider: TaskProvider,
    ) {
        super();
    }
    async process(job: Job<TaskQueue, any, TaskName>): Promise<ConsumerResponse> {
        this.logger.log(`Processing task "${job.name}" with data ${JSON.stringify(job.data)}`, TaskConsumer.name);
        return ConsumerResponse.SUCCESS;
        // return this.taskProvider
        //     .execute(job.name, job.data)
        //     .then(() => {
        //         this.logger.log(
        //             `Task "${job.name}" processed successfully with data ${JSON.stringify(job.data)}`,
        //             TaskConsumer.name,
        //         );
        //         return ConsumerResponse.SUCCESS;
        //     })
        //     .catch((error) => {
        //         this.logger.error(
        //             `Error processing task "${job.name}" - ${error.message} - ${error.stack}`,
        //             TaskConsumer.name,
        //         );
        //         throw error;
        //     });
    }
}
