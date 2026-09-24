import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ClsService } from "nestjs-cls";

import { TaskName } from "snu-lib";

import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { AdminTaskImportReferentielSelectorService } from "./AdminTaskImportReferentielSelector.service";
import { AdminTaskInscriptionSelectorService } from "./AdminTaskInscriptionSelector.service";
import { AdminTaskEngagementSelectorService } from "./AdminTaskEngagementSelector";
import { SentryExceptionCaptured } from "@sentry/nestjs";

// Écritures phase 1 supprimées (affectation, désistement, bascule) : plus aucune route ne crée ces
// tâches. Une tâche restée en file est marquée en échec avec un message explicite, sans planter le worker.
export const ADMIN_TASKS_SUPPRIMEES: string[] = [
    TaskName.AFFECTATION_HTS_SIMULATION,
    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_SIMULATION,
    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
    TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
    TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
];

@Processor(QueueName.ADMIN_TASK, { lockDuration: 1000 * 60 * 2 })
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly adminTaskInscriptionSelectorService: AdminTaskInscriptionSelectorService,
        private readonly adminTaskEngagementSelectorService: AdminTaskEngagementSelectorService,
        private readonly referentielTaskService: AdminTaskImportReferentielSelectorService,
        private readonly cls: ClsService,
    ) {
        super();
    }

    @SentryExceptionCaptured()
    async process(job: Job<TaskQueue, any, TaskName>): Promise<ConsumerResponse> {
        // TODO : benchmark sur les perf de la création d'un contexte cls
        return this.cls.run(async () => {
            this.logger.log(
                `Processing task "${job.name}" with data ${JSON.stringify(job.data)}`,
                AdminTaskConsumer.name,
            );

            let results: Record<string, any> = {};
            try {
                const task = await this.adminTaskRepository.toInProgress(job.data.id);
                this.cls.set("user", { id: "", firstName: job.name, lastName: task.metadata?.parameters?.type });
                switch (job.name) {
                    case TaskName.JEUNE_EXPORT:
                        results = await this.adminTaskInscriptionSelectorService.handleInscription(job, task);
                        break;
                    case TaskName.REFERENTIEL_IMPORT:
                        const importTask: ReferentielImportTaskModel = task;
                        this.logger.log(
                            `Processing import task "${importTask.metadata?.parameters?.type}"`,
                            AdminTaskConsumer.name,
                        );
                        results = await this.referentielTaskService.handleImporterReferentiel(importTask);
                        break;
                    case TaskName.MISSION_EXPORT_CANDIDATURES:
                    case TaskName.MISSION_EXPORT:
                        results = await this.adminTaskEngagementSelectorService.handleEngagement(job, task);
                        break;
                    default:
                        if (ADMIN_TASKS_SUPPRIMEES.includes(job.name)) {
                            throw new Error(`Task "${job.name}" supprimée (écritures phase 1 retirées)`);
                        }
                        throw new Error(`Task "${job.name}" not handle yet`);
                }
            } catch (error: any) {
                this.logger.error(
                    `Error processing task "${job.name}" - ${error.message} - ${error.options?.description} - ${error.stack}`,
                    AdminTaskConsumer.name,
                );
                await this.adminTaskRepository.toFailed(job.data.id, error.message, error.options?.description);
                return ConsumerResponse.FAILURE;
            }
            this.logger.log(
                `Task "${job.name}" processed successfully with data ${JSON.stringify(job.data)}`,
                AdminTaskConsumer.name,
            );
            await this.adminTaskRepository.toSuccess(job.data.id, results);
            return ConsumerResponse.SUCCESS;
        });
    }
}
