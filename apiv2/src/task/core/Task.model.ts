import { TaskName, TaskStatus } from "snu-lib";

export type TaskMetadata<T, U> = {
    parameters?: T;
    results?: U;
};

export type TaskModel<T = any, U = any> = {
    id: string;
    name: TaskName;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status: TaskStatus;
    metadata?: TaskMetadata<T, U>;
    error?: {
        code?: string;
        description?: string;
    };
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTaskModel<T = any, U = any> = Omit<TaskModel<T, U>, "id" | "createdAt" | "updatedAt">;
