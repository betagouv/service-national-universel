import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { PlanMarketingActionSelectorService } from "@plan-marketing/core/PlanMarketingActionSelector.service";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { PLAN_MARKETING_FOLDER_PATH_EXPORT } from "snu-lib";
import { ImporterEtCreerListeDiffusion } from "../../core/useCase/ImporterEtCreerListeDiffusion";
import { BrevoWebhookGuard } from "../guard/BrevoWebhook.guard";

export const PLAN_MARKETING_PATH_FILE_REGEX = new RegExp(`^${PLAN_MARKETING_FOLDER_PATH_EXPORT}/[A-Za-z0-9_-]+\\.csv$`);

export class ImporterContactsEtCreerListeDiffusionDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    campagneId: string;

    // Seuls les CSV déposés par l'import marketing (api v1 `POST /plan-marketing/import`) peuvent
    // être envoyés à Brevo : le fichier est lu dans le bucket partagé sans autre contrôle.
    @IsString()
    @IsNotEmpty()
    @Matches(PLAN_MARKETING_PATH_FILE_REGEX)
    pathFile: string;
}

@Controller("plan-marketing")
export class PlanMarketingController {
    private readonly logger: Logger = new Logger(PlanMarketingController.name);

    constructor(
        private readonly importerEtCreerListeDiffusion: ImporterEtCreerListeDiffusion,
        private readonly planMarketingActionSelectorService: PlanMarketingActionSelectorService,
    ) {}

    /**
     * @deprecated Utiliser CreerListeDiffusion et ImporterContacts. Encore appelée par l'export
     * Brevo des listes Volontaires / Inscriptions (`useBrevoExport`), réservé aux super-administrateurs.
     */
    @UseGuards(SuperAdminGuard)
    @Post("liste-diffusion")
    async creer(@Body() dto: ImporterContactsEtCreerListeDiffusionDto) {
        await this.importerEtCreerListeDiffusion.execute(dto.nom, dto.campagneId, dto.pathFile);
    }

    @Post("import/webhook")
    @UseGuards(BrevoWebhookGuard)
    async webhook(@Body("proc_success") processId: string) {
        this.logger.log(`Webhook received from Brevo for processId: ${processId}`);
        await this.planMarketingActionSelectorService.selectAction(Number(processId));
    }
}
