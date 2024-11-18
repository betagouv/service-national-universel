import { TaskModel } from "src/task/core/Task.model";

export enum QueueType {
    ADMIN_TASK = "admin-task",
}

export type TaskQueue = Pick<TaskModel, "id" | "name">;
