import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UseCase } from "@shared/core/UseCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskName, TaskStatus } from "snu-lib";
import { PlanMarketingCreateTaskModel } from "../PlanMarketing.model";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";

// TODO: finir usecase
@Injectable()
export class ImporterEtCreerListeDiffusion implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterEtCreerListeDiffusion.name);

    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly config: ConfigService,
    ) {}

    async execute(nomListe: string, campagneId: string, folderId: number, pathFile: string): Promise<void> {
        this.logger.log(`nomListe: ${nomListe}, campagneId: ${campagneId}`);
        // Récupérer la liste des contacts : S3 ou fichier binaire dans payload

        // Mapper les champs
        const contacts = `NOM;PRENOM;EMAIL
mon nom;mon prenom;monemail@test.com`;

        // Importer les contacts via
        const processId = await this.planMarketingGateway.importerContacts(
            nomListe,
            contacts,
            folderId,
            `${this.config.get("urls.apiv2")}/plan-marketing/import/webhook`,
        );

        const planMarketingTaskModel: PlanMarketingCreateTaskModel = {
            name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE,
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
