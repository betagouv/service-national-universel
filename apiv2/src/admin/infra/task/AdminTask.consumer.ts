import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { Job } from "bullmq";
import { ReferentielImportTaskParameters, ReferentielTaskType, TaskName } from "snu-lib";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import {
    SimulationAffectationHTSTaskModel,
    SimulationAffectationHTSTaskResult,
} from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/ReferentielImportTask.model";
import { ImportRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImportRegionsAcademiques";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly importRegionAcademique: ImportRegionsAcademiques,
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
                case TaskName.REFERENTIEL_IMPORT:
                    await this.dispatchReferentielTaskImport(task as ReferentielImportTaskModel);
                    break;
                case TaskName.IMPORT_CLASSE:
                    // TODO: call usecase
                    throw new TechnicalException(TechnicalExceptionType.NOT_IMPLEMENTED_YET);
                case TaskName.AFFECTATION_HTS_SIMULATION:
                    results = await this.handleSimulation(task as SimulationAffectationHTSTaskModel);
                    break;
                default:
                    throw new Error(`Task "${job.name}" not handled yet`);
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

    private async dispatchReferentielTaskImport(task: ReferentielImportTaskModel) {
        switch (task.metadata?.parameters?.type) {
            case ReferentielTaskType.IMPORT_REGION_ACADEMIQUE:
                await this.importRegionAcademique.execute(task.metadata.parameters as ReferentielImportTaskParameters);
                break;
            case ReferentielTaskType.IMPORT_ROUTES:
                await this.importerRoutes.execute(task.metadata!.parameters!);
                break;
            default:
                throw new Error(`Type d'import "${task.metadata?.parameters?.type}" non géré`);
        }
    }
    
    private async handleSimulation(task: SimulationAffectationHTSTaskModel) {
        const simulation = await this.simulationAffectationHts.execute(task.metadata!.parameters!);
        return {
            rapportUrl: simulation.rapportFile.Location,
            rapportKey: simulation.rapportFile.Key,
            selectedCost: simulation.analytics.selectedCost,
            jeunesNouvellementAffected: simulation.analytics.jeunesNouvellementAffected,
            jeuneAttenteAffectation: simulation.analytics.jeuneAttenteAffectation,
            jeunesDejaAffected: simulation.analytics.jeunesDejaAffected,
        } as SimulationAffectationHTSTaskResult;
    }
}

