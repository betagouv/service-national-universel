import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@shared/core/task/Task.gateway";
import { TaskModel } from "@shared/core/task/Task.model";
import { Queue } from "bullmq";
import { Model } from "mongoose";
import { TaskName } from "snu-lib";
import { QueueType } from "../Queue";
import { TaskMapper } from "./Task.mapper";
import { TASK_MONGOOSE_ENTITY, TaskDocument } from "./TaskMongo.provider";

@Injectable()
export class TaskRepository implements TaskGateway {
    constructor(
        @Inject(TASK_MONGOOSE_ENTITY) private taskMongooseEntity: Model<TaskDocument>,
        @InjectQueue(QueueType.TASK) private taskQueue: Queue,
    ) {}

    async createTask(task: TaskModel): Promise<TaskModel> {
        const createdTask = await this.taskMongooseEntity.create(TaskMapper.toEntity(task));
        await this.taskQueue.add(task.name, { task: TaskMapper.toQueue(createdTask) });
        return TaskMapper.toModel(await createdTask.save());
    }

    async getTasks(): Promise<TaskModel[]> {
        const tasks = await this.taskMongooseEntity.find({});
        return tasks.map((task) => TaskMapper.toModel(task));
    }

    async getTask(id: string): Promise<TaskModel> {
        const task = await this.taskMongooseEntity.findById(id);
        if (!task) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(task);
    }

    async deleteTask(id: string): Promise<void> {
        await this.taskMongooseEntity.deleteOne({ _id: id });
    }

    async updateTask(id: string, task: TaskModel): Promise<TaskModel> {
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(id, TaskMapper.toEntity(task), {
            new: true,
        });
        if (!updatedTask) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(updatedTask);
    }
}
