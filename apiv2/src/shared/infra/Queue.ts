import { TaskModel } from "src/task/core/Task.model";

export enum QueueName {
    EMAIL = "email",
    CONTACT = "contact",
    ADMIN_TASK = "admin-task",
}

export type TaskQueue = Pick<TaskModel, "id" | "name">;
