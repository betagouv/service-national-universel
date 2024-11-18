import { TaskName, TaskStatus } from "snu-lib";

export type TaskModel = {
    id: string;
    name: TaskName;
    libelle?: string;
    startDate: Date;
    endDate?: Date;
    status: TaskStatus;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTaskModel = Omit<TaskModel, "id" | "createdAt" | "updatedAt">;
