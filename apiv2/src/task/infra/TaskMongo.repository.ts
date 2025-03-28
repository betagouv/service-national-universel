import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { TaskStatus } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { CreateTaskModel, TaskModel } from "@task/core/Task.model";
import { TaskMapper } from "./Task.mapper";
import { TASK_MONGOOSE_ENTITY, TaskDocument } from "./TaskMongo.provider";

@Injectable()
export class TaskRepository implements TaskGateway {
    constructor(@Inject(TASK_MONGOOSE_ENTITY) protected taskMongooseEntity: Model<TaskDocument>) {}
    // TODO : improve this method
    async findByMetadata<T, U>(metadata: object): Promise<TaskModel<T, U>[] | []> {
        const tasks = await this.taskMongooseEntity.find(metadata);
        return tasks.map((task) => TaskMapper.toModel(task));
    }

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
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "task");
        }
        return TaskMapper.toModel(task);
    }

    async findByNames(
        names: Array<CreateTaskModel["name"]>,
        filter?: { [key: string]: string | undefined },
        sort?: "ASC" | "DESC",
        limit?: number,
    ): Promise<TaskModel[]> {
        const tasks = await this.taskMongooseEntity
            .find({ name: { $in: names }, ...filter })
            .sort({ createdAt: sort === "ASC" ? 1 : -1 })
            .limit(limit || 100);
        return tasks.map((task) => TaskMapper.toModel(task));
    }

    async delete(id: string): Promise<void> {
        await this.taskMongooseEntity.deleteOne({ _id: id });
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.taskMongooseEntity.deleteMany({ _id: { $in: ids } });
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

    async toInProgress(id: string): Promise<TaskModel> {
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(
            id,
            { status: TaskStatus.IN_PROGRESS, startDate: new Date() },
            {
                new: true,
            },
        );
        if (!updatedTask) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(updatedTask);
    }

    async toSuccess(id: string, results: object): Promise<TaskModel> {
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(
            id,
            { status: TaskStatus.COMPLETED, endDate: new Date(), "metadata.results": results },
            {
                new: true,
            },
        );
        if (!updatedTask) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return TaskMapper.toModel(updatedTask);
    }
    async toFailed(id: string, code?: string, description?: string): Promise<TaskModel> {
        const updatedTask = await this.taskMongooseEntity.findByIdAndUpdate(
            id,
            { status: TaskStatus.FAILED, endDate: new Date(), error: { code, description } },
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
