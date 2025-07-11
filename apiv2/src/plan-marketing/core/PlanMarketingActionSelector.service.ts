import { Inject, Injectable, Logger } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { PlanMarketingTaskParameters, PlanMarketingTaskResults } from "./PlanMarketing.model";
import { TaskName } from "snu-lib";
import { AssocierListeDiffusionToCampagne } from "./useCase/AssocierListeDiffusionToCampagne";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { EnvoyerCampagne } from "./useCase/EnvoyerCampagne";

@Injectable()
export class PlanMarketingActionSelectorService {
    private readonly logger: Logger = new Logger(PlanMarketingActionSelectorService.name);

    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly associerListeDiffusionToCampagne: AssocierListeDiffusionToCampagne,
        private readonly envoyerCampagne: EnvoyerCampagne,
    ) {}

    async selectAction(processId: number) {
        this.logger.log(`Selecting action for processId ${processId}`);
        if (!processId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `ProcessId: ${processId} is required`);
        }
        const task = (
            await this.taskGateway.findByMetadata<PlanMarketingTaskParameters, PlanMarketingTaskResults>({
                "metadata.parameters.processId": processId,
            })
        )[0];
        if (!task) {
            throw new FunctionalException(
                FunctionalExceptionCode.TASK_NOT_FOUND,
                `Task not found for processId ${processId}`,
            );
        }
        try {
            switch (task.name) {
                case TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE:
                    await this.associerListeDiffusionToCampagne.execute(
                        task.metadata?.parameters?.nomListe,
                        task.metadata?.parameters?.campagneProviderId,
                    );
                    await this.taskGateway.toSuccess(task.id, {
                        description: "Liste de diffusion créée et associée à la campagne",
                    });
                    break;
                case TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE_PUIS_ENVOYER_CAMPAGNE:
                    await this.envoyerCampagne.execute(
                        task.metadata?.parameters?.nomListe,
                        task.metadata?.parameters?.campagneId,
                        task.metadata?.parameters?.campagneProviderId,
                        task.metadata?.parameters?.programmationId,
                    );
                    await this.taskGateway.toSuccess(task.id, {
                        description: "Campagne et liste envoyées au provider",
                    });
                    break;
                default: {
                    this.logger.error(`Task ${task.name} not found`);
                    this.taskGateway.toFailed(task.id, "", "Task not found");
                    throw new FunctionalException(FunctionalExceptionCode.TASK_NOT_FOUND);
                }
            }
        } catch (e) {
            const error = e as FunctionalException;
            this.taskGateway.toFailed(task.id, error.message, error.description);
            throw error;
        }
    }
}
