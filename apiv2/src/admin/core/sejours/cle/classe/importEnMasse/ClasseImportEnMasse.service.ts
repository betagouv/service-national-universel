import { Inject, Injectable } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { CreateTaskModel } from "@task/core/Task.model";
import { ImportClasseEnMasseTaskResults } from "./ClasseImportEnMasse.model";
import { ImportClasseEnMasseTaskParameters } from "./ClasseImportEnMasse.model";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";
@Injectable()
export class ClasseImportService {
    constructor(
        @Inject(TaskGateway)
        private readonly taskGateway: TaskGateway,
    ) {}

    async importClasse(
        classeId: string,
        mapping: Record<string, string> | null,
        fileKey: string,
        auteur: Partial<ReferentModel>,
    ) {
        const task: CreateTaskModel<ImportClasseEnMasseTaskParameters, ImportClasseEnMasseTaskResults> =
            await this.taskGateway.create({
                name: TaskName.IMPORT_CLASSE_EN_MASSE,
                status: TaskStatus.PENDING,
                metadata: {
                    parameters: {
                        classeId,
                        mapping,
                        fileKey,
                        auteur,
                    },
                },
            });
        return task;
    }
}
