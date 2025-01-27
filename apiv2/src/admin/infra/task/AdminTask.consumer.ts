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
import { AdminTaskAffectationSelectorService } from "./AdminTaskAffectationSelector.service";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly adminTaskAffectationSelectorService: AdminTaskAffectationSelectorService,
        private readonly referentielTaskService: AdminTaskImportReferentielSelectorService,
        private readonly cls: ClsService,
    ) {
        super();
    }
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
                    case TaskName.AFFECTATION_HTS_SIMULATION:
                    case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                    case TaskName.AFFECTATION_CLE_SIMULATION:
                    case TaskName.AFFECTATION_CLE_SIMULATION_VALIDER:
                        results = await this.adminTaskAffectationSelectorService.handleAffectation(job, task);
                        break;
                    case TaskName.REFERENTIEL_IMPORT:
                        const importTask = task as ReferentielImportTaskModel;
                        this.logger.log(
                            `Processing import task "${importTask.metadata?.parameters?.type}"`,
                            AdminTaskConsumer.name,
                        );
                        results = await this.referentielTaskService.handleImporterReferentiel(importTask);
                        break;
                    default:
                        throw new Error(`Task "${job.name}" not handle yet`);
                }
            } catch (error: any) {
                this.logger.error(
                    `Error processing task "${job.name}" - ${error.message} - ${error.stack}`,
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
