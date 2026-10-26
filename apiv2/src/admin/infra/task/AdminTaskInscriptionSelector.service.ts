import { Job } from "bullmq";
import { TaskName } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import { TaskModel } from "@task/core/Task.model";

import { ExporterJeunes } from "@admin/core/sejours/phase1/jeune/ExporterJeunes";

// Les bascules de jeunes (simulation et validation) sont supprimées avec les écritures phase 1 :
// seul l'export des jeunes reste traité ici.
@Injectable()
export class AdminTaskInscriptionSelectorService {
    constructor(private readonly exportJeunes: ExporterJeunes) {}

    async handleInscription(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        switch (job.name) {
            case TaskName.JEUNE_EXPORT: {
                const exportInscription = await this.exportJeunes.execute(task.metadata!.parameters!);
                return {
                    rapportKey: exportInscription.rapportFile.Key,
                    ...exportInscription.analytics,
                };
            }
            default:
                throw new Error(`Task of type ${job.name} not handle yet for inscription`);
        }
    }
}
