import { TaskModel } from "@shared/core/task/Task.model";

export enum QueueType {
    TASK = "task",
}

export type TaskQueue = Pick<TaskModel, "id" | "name">;
