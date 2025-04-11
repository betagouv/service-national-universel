import { TaskModel } from "@task/core/Task.model";

export enum QueueName {
    EMAIL = "email",
    CONTACT = "contact",
    ADMIN_TASK = "admin-task",
    CRON = "cron-v2",
}

export type TaskQueue = Pick<TaskModel, "id" | "name">;
