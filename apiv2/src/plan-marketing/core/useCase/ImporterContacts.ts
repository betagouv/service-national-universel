import { Inject, Injectable } from "@nestjs/common";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { PlanMarketingCreateTaskModel, PlanMarketingTaskModel } from "../PlanMarketing.model";
import { TaskName, TaskStatus } from "snu-lib";
import { UseCase } from "@shared/core/UseCase";

// TODO: finir usecase
@Injectable()
export class ImporterContacts implements UseCase<void> {
    constructor(
        private readonly listeDiffusionGateway: PlanMarketingGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    async execute(nomListe: string, campagneId: string): Promise<void> {
        // Récupérer la liste des contacts : S3 ou fichier binaire dans payload

        // Mapper les champs

        // Importer les contacts via
        const processId = await this.listeDiffusionGateway.importerContacts(nomListe, []);

        const planMarketingTaskModel: PlanMarketingCreateTaskModel = {
            name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    processId: processId,
                    nomListe: nomListe,
                    campagneId: campagneId,
                },
            },
        };
        await this.taskGateway.create(planMarketingTaskModel);
    }
}
