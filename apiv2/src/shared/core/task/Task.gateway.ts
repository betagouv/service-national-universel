import { CreateTaskModel, TaskModel } from "./Task.model";

export interface TaskGateway {
    createTask(task: CreateTaskModel): Promise<TaskModel>;
    getTasks(): Promise<TaskModel[]>;
    getTask(id: string): Promise<TaskModel>;
    deleteTask(id: string): Promise<void>;
    updateTask(id: string, task: TaskModel): Promise<TaskModel>;
}
