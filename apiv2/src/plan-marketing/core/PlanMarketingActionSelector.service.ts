import { Inject, Injectable, Logger } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { PlanMarketingTaskParameters, PlanMarketingTaskResults } from "./PlanMarketing.model";
import { TaskName } from "snu-lib";
import { AssocierListeDiffusionToCampagne } from "./useCase/AssocierListeDiffusionToCampagne";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
Injectable();
export class PlanMarketingActionSelectorService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly associerListeDiffusionToCampagne: AssocierListeDiffusionToCampagne,
        private readonly logger: Logger,
    ) {}

    async selectAction(processId: string) {
        const task = (
            await this.taskGateway.findByMetatdata<PlanMarketingTaskParameters, PlanMarketingTaskResults>({
                metadata: { parameters: processId },
            })
        )?.[0];
        switch (task.name) {
            case TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE:
                return this.associerListeDiffusionToCampagne.execute(
                    task.metadata?.parameters?.nomListe,
                    task.metadata?.parameters?.campagneId,
                );
            default: {
                this.logger.error(`Task ${task.name} not found`);
                this.taskGateway.toFailed(task.id, "", "Task not found");
                throw new FunctionalException(FunctionalExceptionCode.TASK_NOT_FOUND);
            }
        }
    }
}
