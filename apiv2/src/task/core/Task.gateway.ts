import { CreateTaskModel, TaskModel } from "./Task.model";

export interface TaskGateway {
    create(task: CreateTaskModel): Promise<TaskModel>;
    findAll(): Promise<TaskModel[]>;
    findById(id: string): Promise<TaskModel>;
    delete(id: string): Promise<void>;
    update(id: string, task: TaskModel): Promise<TaskModel>;
    toSuccess(id: string): Promise<TaskModel>;
}

export const TaskGateway = Symbol("TaskGateway");
