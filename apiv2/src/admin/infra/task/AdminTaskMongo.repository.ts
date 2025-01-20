import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { QueueName } from "@shared/infra/Queue";
import { TaskGateway } from "@task/core/Task.gateway";
import { CreateTaskModel, TaskModel } from "@task/core/Task.model";
import { TaskMapper } from "@task/infra/Task.mapper";
import { Queue } from "bullmq";
import { Model } from "mongoose";
import { TASK_MONGOOSE_ENTITY, TaskDocument } from "@task/infra/TaskMongo.provider";
import { TaskRepository } from "@task/infra/TaskMongo.repository";

@Injectable()
export class AdminTaskRepository extends TaskRepository implements TaskGateway {
    constructor(
        @Inject(TASK_MONGOOSE_ENTITY) protected taskMongooseEntity: Model<TaskDocument>,
        @InjectQueue(QueueName.ADMIN_TASK) private adminTaskQueue: Queue,
    ) {
        super(taskMongooseEntity);
    }

    async create(task: CreateTaskModel): Promise<TaskModel> {
        const createdTask = await super.create(task);
        await this.adminTaskQueue.add(task.name, { ...TaskMapper.toQueue(createdTask) });
        return createdTask;
    }
}
