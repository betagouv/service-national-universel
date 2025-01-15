import mongoose, { Model } from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { TaskName, TaskStatus } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";
import { getAdminTestModuleRef } from "./setUpAdminTest";
import { TaskMapper } from "@task/infra/Task.mapper";
import { TASK_MONGOOSE_ENTITY, TaskDocument } from "@task/infra/TaskMongo.provider";

export const createTask = async (task?: Partial<TaskModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const taskMongooseEntity = adminTestModule.get<Model<TaskDocument>>(TASK_MONGOOSE_ENTITY);

    const taskEntity = TaskMapper.toEntityCreate({
        id: new mongoose.Types.ObjectId().toString(),
        name: faker.helpers.arrayElement(Object.values(TaskName)),
        status: TaskStatus.PENDING,
        ...task,
    });

    if (task?.createdAt) {
        taskEntity.createdAt = task.createdAt;
    }

    return await taskMongooseEntity.create(taskEntity);
};
