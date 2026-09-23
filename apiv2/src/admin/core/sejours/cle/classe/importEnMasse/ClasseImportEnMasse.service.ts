import { Inject, Injectable } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { CreateTaskModel } from "@task/core/Task.model";
import { ImportClasseEnMasseTaskResults } from "./ClasseImportEnMasse.model";
import { ImportClasseEnMasseTaskParameters, isInscriptionEnMasseFileKeyOfClasse } from "./ClasseImportEnMasse.model";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

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
        // Seul un fichier validé pour cette classe (dossier S3 de la classe) peut être importé.
        if (!isInscriptionEnMasseFileKeyOfClasse(fileKey, classeId)) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID, "fichier non rattaché à la classe");
        }
        // Usage unique : un fichier validé ne donne lieu qu'à un seul import.
        const importsExistants = await this.taskGateway.findByNames(
            [TaskName.IMPORT_CLASSE_EN_MASSE],
            { "metadata.parameters.fileKey": fileKey },
            undefined,
            1,
        );
        if (importsExistants.length > 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID, "fichier déjà importé");
        }
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
