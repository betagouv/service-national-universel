import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { TaskName, TaskStatus } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { getAdminTestModuleRef } from "./setUpAdminTest";

export const createTask = async (task?: Partial<TaskModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const taskGateway = adminTestModule.get<TaskGateway>(TaskGateway);

    return await taskGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        name: faker.helpers.arrayElement(Object.values(TaskName)),
        status: TaskStatus.PENDING,
        ...task,
    });
};
