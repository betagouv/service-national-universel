import { TaskModel } from "@shared/core/task/Task.model";
import { TaskType } from "snu-lib";
import { TaskDocument } from "./TaskMongo.provider";
import { TaskQueue } from "../Queue";

export class TaskMapper {
    static toModel(taskType: TaskDocument): TaskModel {
        return {
            id: taskType._id.toString(),
            name: taskType.name,
            libelle: taskType.libelle,
            startDate: taskType.startDate,
            endDate: taskType.endDate,
            status: taskType.status,
            metadata: taskType.metadata,
            createdAt: taskType.createdAt,
            updatedAt: taskType.updatedAt,
        };
    }

    static toQueue(taskType: TaskDocument): TaskQueue {
        return {
            id: taskType._id.toString(),
            name: taskType.name,
        };
    }

    static toEntity(taskModel: TaskModel): TaskType {
        return {
            _id: taskModel.id,
            name: taskModel.name,
            libelle: taskModel.libelle,
            startDate: taskModel.startDate,
            endDate: taskModel.endDate,
            status: taskModel.status,
            metadata: {
                ...taskModel.metadata,
            },
            createdAt: taskModel.createdAt,
            updatedAt: taskModel.updatedAt,
        };
    }
}
