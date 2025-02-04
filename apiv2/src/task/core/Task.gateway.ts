import { CreateTaskModel, TaskModel } from "./Task.model";

export interface TaskGateway {
    create(task: CreateTaskModel): Promise<TaskModel>;
    findAll(): Promise<TaskModel[]>;
    findByNames(
        name: Array<CreateTaskModel["name"]>,
        filter?: { [key: string]: string | undefined },
        sort?: "ASC" | "DESC",
        limit?: number,
    ): Promise<TaskModel[]>;
    findById(id: string): Promise<TaskModel>;
    delete(id: string): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
    update(id: string, task: TaskModel): Promise<TaskModel>;
    toSuccess(id: string, result: object): Promise<TaskModel>;
    toInProgress(id: string): Promise<TaskModel>;
    toFailed(id: string, code?: string, description?: string): Promise<TaskModel>;
    findByMetatdata<T, U>(metadata: object): Promise<TaskModel<T, U>[]>;
}

export const TaskGateway = Symbol("TaskGateway");
