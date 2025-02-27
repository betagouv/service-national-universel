import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskName, TaskStatus } from "snu-lib";
import { PlanMarketingCreateTaskModel } from "../PlanMarketing.model";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

// TODO: finir usecase
@Injectable()
export class ImporterEtCreerListeDiffusion implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterEtCreerListeDiffusion.name);

    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly config: ConfigService,
    ) {}

    async execute(nomListe: string, campagneId: string, pathFile: string): Promise<void> {
        this.logger.log(`nomListe: ${nomListe}, campagneId: ${campagneId}, pathFile: ${pathFile}`);
        const campagne = await this.planMarketingGateway.findCampagneById(campagneId);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        await this.planMarketingGateway.deleteOldList();

        // TODO : Veiller à récupérer le bon filePath => Eric
        const file = await this.fileGateway.downloadFile(pathFile);
        const contacts = file.Body.toString();

        const processId = await this.planMarketingGateway.importerContacts(
            nomListe,
            contacts,
            this.config.get("marketing.folderId")!,
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
