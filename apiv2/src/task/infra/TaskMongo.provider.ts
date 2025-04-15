import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { MONGO_COLLECTION, TaskSchema, TaskType } from "snu-lib";

export type TaskDocument = HydratedDocument<TaskType>;
export const TaskName = MONGO_COLLECTION.TASK;
export const TASK_MONGOOSE_ENTITY = "TASK_MONGOOSE_ENTITY";

const TaskSchemaRef = new mongoose.Schema(TaskSchema);

TaskSchemaRef.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export const taskMongoProviders = [
    {
        provide: TASK_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(TaskName, TaskSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
