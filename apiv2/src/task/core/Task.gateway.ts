import { CreateTaskModel, TaskModel } from "./Task.model";

export interface TaskGateway {
    create(task: CreateTaskModel): Promise<TaskModel>;
    findAll(): Promise<TaskModel[]>;
    findByName(name: CreateTaskModel["name"], filter?: { [key: string]: string }): Promise<TaskModel[]>;
    findById(id: string): Promise<TaskModel>;
    delete(id: string): Promise<void>;
    update(id: string, task: TaskModel): Promise<TaskModel>;
    toSuccess(id: string, result: object): Promise<TaskModel>;
}

export const TaskGateway = Symbol("TaskGateway");
