import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { Job } from "bullmq";
import { ReferentielTaskType, TaskName } from "snu-lib";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import {
    SimulationAffectationHTSTaskModel,
    SimulationAffectationHTSTaskResult,
} from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly importerRoutes: ImporterRoutes,
    ) {
        super();
    }
    async process(job: Job<TaskQueue, any, TaskName>): Promise<ConsumerResponse> {
        this.logger.log(`Processing task "${job.name}" with data ${JSON.stringify(job.data)}`, AdminTaskConsumer.name);
        let results: Record<string, any> = {};
        try {
            const task = await this.adminTaskRepository.toInProgress(job.data.id);
            switch (job.name) {
                case TaskName.IMPORT_CLASSE:
                    // TODO: call usecase
                    throw new TechnicalException(TechnicalExceptionType.NOT_IMPLEMENTED_YET);
                case TaskName.AFFECTATION_HTS_SIMULATION:
                    const simulationTask = task as SimulationAffectationHTSTaskModel;
                    const simulation = await this.simulationAffectationHts.execute(
                        simulationTask.metadata!.parameters!,
                    );
                    results = {
                        rapportKey: simulation.rapportFile.Key,
                        selectedCost: simulation.analytics.selectedCost,
                        jeunesNouvellementAffected: simulation.analytics.jeunesNouvellementAffected,
                        jeuneAttenteAffectation: simulation.analytics.jeuneAttenteAffectation,
                        jeunesDejaAffected: simulation.analytics.jeunesDejaAffected,
                    } as SimulationAffectationHTSTaskResult;
                    break;
                case TaskName.REFERENTIEL_IMPORT:
                    const importTask = task as ReferentielImportTaskModel;
                    // TODO: seperate switch case of type in a service
                    if (importTask.metadata?.parameters?.type === ReferentielTaskType.IMPORT_ROUTES) {
                        // TODO: handle import results
                        await this.importerRoutes.execute(importTask.metadata!.parameters!);
                    } else {
                        throw new Error(
                            `Task "${job.name}" of type ${importTask.metadata?.parameters?.type} not handle yet`,
                        );
                    }
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
    }
}
