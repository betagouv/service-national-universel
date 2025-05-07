import { Inject, Injectable } from "@nestjs/common";

import { TaskName, TaskStatus, CLASSE_IMPORT_EN_MASSE_COLUMNS } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";

import { ClasseGateway } from "./Classe.gateway";
import { ClasseModel } from "./Classe.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

export type StatusImportInscriptionEnMasse = {
    status: TaskStatus | "NONE";
    statusDate: Date;
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
            statusDate: lastImport?.updatedAt,
            lastCompletedAt: lastImportCompleted?.updatedAt,
        };
    }

    async findById(id: string): Promise<ClasseModel> {
        const classe = await this.classeGateway.findById(id);
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return classe;
    }

    checkImportMapping(mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>): void {
        Object.keys(mapping).forEach((key) => {
            if (!Object.values(CLASSE_IMPORT_EN_MASSE_COLUMNS).includes(key as CLASSE_IMPORT_EN_MASSE_COLUMNS)) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA, key);
            }
        });
    }
}
