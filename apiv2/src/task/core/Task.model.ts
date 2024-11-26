import { TaskName, TaskStatus } from "snu-lib";

export type TaskMetadata<T, U> = {
    parameters?: T;
    results?: U;
};

export type TaskModel<T = object, U = object> = {
    id: string;
    name: TaskName;
    libelle?: string;
    startDate?: Date;
    endDate?: Date;
    status: TaskStatus;
    metadata?: TaskMetadata<T, U>;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTaskModel<T = object, U = object> = Omit<TaskModel<T, U>, "id" | "createdAt" | "updatedAt">;
