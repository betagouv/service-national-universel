import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "src/task/core/Task.gateway";
import { CreateTaskModel, TaskModel } from "src/task/core/Task.model";
import { Queue } from "bullmq";
import { Model } from "mongoose";
import { TaskName, TaskStatus } from "snu-lib";
import { QueueType } from "../../shared/infra/Queue";
import { TaskMapper } from "./Task.mapper";
import { TASK_MONGOOSE_ENTITY, TaskDocument } from "./TaskMongo.provider";

@Injectable()
export class TaskRepository implements TaskGateway {
    constructor(@Inject(TASK_MONGOOSE_ENTITY) protected taskMongooseEntity: Model<TaskDocument>) {}

    async create(task: CreateTaskModel): Promise<TaskModel> {
        const createdTask = await this.taskMongooseEntity.create(TaskMapper.toEntityCreate(task));
        return TaskMapper.toModel(createdTask);
    }

    async findAll(): Promise<TaskModel[]> {
        const tasks = await this.taskMongooseEntity.find({});
        return tasks.map((task) => TaskMapper.toModel(task));
    }

    async findById(id: string): Promise<TaskModel> {
        const task = await this.taskMongooseEntity.findById(id);
        if (!task) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(task);
    }

    async delete(id: string): Promise<void> {
        await this.taskMongooseEntity.deleteOne({ _id: id });
    }

    async update(id: string, task: TaskModel): Promise<TaskModel> {
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(id, TaskMapper.toEntity(task), {
            new: true,
        });
        if (!updatedTask) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(updatedTask);
    }

    async toSuccess(id: string): Promise<TaskModel> {
        // TODO: check if task exists and is in progress
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(
            id,
            { status: TaskStatus.COMPLETED },
            {
                new: true,
            },
        );
        if (!updatedTask) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(updatedTask);
    }
}