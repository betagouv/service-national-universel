import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import {
    SimulationAffectationHTSTaskModel,
    SimulationAffectationHTSTaskResult,
} from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { ValiderAffectationHTS } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTS";
import { ValiderAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTSTask.model";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { Job } from "bullmq";
import { TaskName, ValiderAffectationHTSTaskResult } from "snu-lib";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { ReferentielTaskService } from "./ReferentielTask.service";
import { ClsService } from "nestjs-cls";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly validerAffectationHts: ValiderAffectationHTS,
        private readonly referentielTaskService: ReferentielTaskService,
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
                        const simulationHtsTask = task as SimulationAffectationHTSTaskModel; // pour l'onglet historique (patches)
                        const simulation = await this.simulationAffectationHts.execute(
                            simulationHtsTask.metadata!.parameters!,
                        );
                        results = {
                            rapportKey: simulation.rapportFile.Key,
                            selectedCost: simulation.analytics.selectedCost,
                            jeunesNouvellementAffected: simulation.analytics.jeunesNouvellementAffected,
                            jeuneAttenteAffectation: simulation.analytics.jeuneAttenteAffectation,
                            jeunesDejaAffected: simulation.analytics.jeunesDejaAffected,
                        } as SimulationAffectationHTSTaskResult;
                        break;

                    case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                        const validationHtsTask = task as ValiderAffectationHTSTaskModel;
                        const validationResult = await this.validerAffectationHts.execute({
                            ...validationHtsTask.metadata!.parameters!,
                            dateAffectation: validationHtsTask.createdAt,
                        });
                        results = {
                            rapportKey: validationResult.rapportFile.Key,
                            jeunesAffected: validationResult.analytics.jeunesAffected,
                            errors: validationResult.analytics.errors,
                        } as ValiderAffectationHTSTaskResult;
                        // TODO: handle errors with partial results for all tasks
                        if (validationResult.analytics.jeunesAffected === 0) {
                            await this.adminTaskRepository.update(task.id, {
                                ...task,
                                metadata: {
                                    ...task.metadata,
                                    results,
                                },
                            });
                            await this.adminTaskRepository.toFailed(job.data.id, "Aucun jeune n'a été affecté");
                            return ConsumerResponse.FAILURE;
                        }
                        break;

                    case TaskName.REFERENTIEL_IMPORT:
                        const importTask = task as ReferentielImportTaskModel;
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
