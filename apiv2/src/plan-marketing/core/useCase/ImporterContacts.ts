import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskName, TaskStatus } from "snu-lib";
import { CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
import { PlanMarketingCreateTaskModel } from "../PlanMarketing.model";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ListeDiffusionGateway } from "../gateway/ListeDiffusion.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";

@Injectable()
export class ImporterContacts implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterContacts.name);

    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(ListeDiffusionGateway) private readonly listeDiffusionGateway: ListeDiffusionGateway,
        @Inject(CryptoGateway) private readonly cryptoGateway: CryptoGateway,
        private readonly config: ConfigService,
    ) {}
    async execute(campagneId: string, campagneFournisseurId: number, contacts: string): Promise<void> {
        this.logger.log(`campagneId: ${campagneId}`);
        const campagne = (await this.campagneGateway.findById(campagneId)) as CampagneSpecifiqueModelWithRefAndGeneric;
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        const listeDiffusion = await this.listeDiffusionGateway.findById(campagne.listeDiffusionId);
        const nomListe = `${listeDiffusion?.nom!}-${this.cryptoGateway.getUuid().slice(0, 8)}`;

        const processId = await this.planMarketingGateway.importerContacts(
            nomListe,
            contacts,
            this.config.get("marketing.folderId")!,
            `${this.config.get("urls.apiv2")}/plan-marketing/import/webhook`,
        );

        const planMarketingTaskModel: PlanMarketingCreateTaskModel = {
            name: TaskName.PLAN_MARKETING_IMPORT_CONTACTS_ET_CREER_LISTE_PUIS_ENVOYER_CAMPAGNE,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    processId: processId,
                    nomListe: nomListe,
                    campagneId: campagneId,
                    campagneProviderId: String(campagneFournisseurId),
                },
            },
        };
        await this.taskGateway.create(planMarketingTaskModel);
    }
}
