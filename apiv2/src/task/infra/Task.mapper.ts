import { CreateTaskModel, TaskModel } from "@task/core/Task.model";
import { TaskType } from "snu-lib";
import { TaskDocument } from "./TaskMongo.provider";
import { TaskQueue } from "../../shared/infra/Queue";

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
            erreur: taskType.erreur,
            createdAt: taskType.createdAt,
            updatedAt: taskType.updatedAt,
        };
    }

    static toQueue(taskType: TaskModel): TaskQueue {
        return {
            id: taskType.id.toString(),
            name: taskType.name,
        };
    }

    static toDto(taskModel: TaskModel) {
        return {
            id: taskModel.id,
            name: taskModel.name,
            libelle: taskModel.libelle,
            startDate: taskModel.startDate?.toISOString(),
            endDate: taskModel.endDate?.toISOString(),
            status: taskModel.status,
            metadata: taskModel.metadata,
            erreur: taskModel.erreur,
            createdAt: taskModel.createdAt.toISOString(),
            updatedAt: taskModel.updatedAt.toISOString(),
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
            erreur: taskModel.erreur,
            createdAt: taskModel.createdAt,
            updatedAt: taskModel.updatedAt,
        };
    }

    static toEntityCreate(taskModel: CreateTaskModel): Omit<TaskType, "_id"> {
        return {
            name: taskModel.name,
            libelle: taskModel.libelle,
            startDate: taskModel.startDate,
            endDate: taskModel.endDate,
            status: taskModel.status,
            metadata: {
                ...taskModel.metadata,
            },
            erreur: taskModel.erreur,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
