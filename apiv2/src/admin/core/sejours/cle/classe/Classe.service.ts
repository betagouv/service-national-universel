import { Inject, Injectable } from "@nestjs/common";

import { TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";

import { ClasseGateway } from "./Classe.gateway";

export type StatusImportInscriptionEnMasse = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

@Injectable()
export class ClasseService {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    async getStatusImportInscriptionEnMasse(classeId: string): Promise<StatusImportInscriptionEnMasse> {
        const lastImport = (
            await this.taskGateway.findByNames(
                [TaskName.IMPORT_CLASSE_EN_MASSE],
                {
                    "metadata.parameters.classeId": classeId,
                },
                "DESC",
                1,
            )
        )?.[0];

        const lastImportCompleted = (
            await this.taskGateway.findByNames(
                [TaskName.IMPORT_CLASSE_EN_MASSE],
                {
                    status: TaskStatus.COMPLETED,
                    "metadata.parameters.classeId": classeId,
                },
                "DESC",
                1,
            )
        )?.[0];
        return {
            status: lastImport?.status || "NONE",
            lastCompletedAt: lastImportCompleted?.updatedAt,
        };
    }
}
