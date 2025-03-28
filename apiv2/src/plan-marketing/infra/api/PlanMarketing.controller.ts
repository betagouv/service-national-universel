import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { PlanMarketingActionSelectorService } from "@plan-marketing/core/PlanMarketingActionSelector.service";
import { IsNotEmpty, IsString } from "class-validator";
import { ImporterEtCreerListeDiffusion } from "../../core/useCase/ImporterEtCreerListeDiffusion";
import { BrevoIpGuard } from "../guard/BrevoIpGuard";

class ImporterContactsEtCreerListeDiffusionDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    campagneId: string;

    @IsString()
    @IsNotEmpty()
    pathFile: string;
}

@Controller("plan-marketing")
export class PlanMarketingController {
    private readonly logger: Logger = new Logger(PlanMarketingController.name);

    constructor(
        private readonly importerEtCreerListeDiffusion: ImporterEtCreerListeDiffusion,
        private readonly planMarketingActionSelectorService: PlanMarketingActionSelectorService,
    ) {}

    @UseGuards(AdminGuard)
    @Post("liste-diffusion")
    async creer(@Body() dto: ImporterContactsEtCreerListeDiffusionDto) {
        await this.importerEtCreerListeDiffusion.execute(dto.nom, dto.campagneId, dto.pathFile);
    }

    @Post("import/webhook")
    @UseGuards(BrevoIpGuard)
    async webhook(@Body("proc_success") processId: string) {
        this.logger.log(`Webhook received from Brevo for processId: ${processId}`);
        await this.planMarketingActionSelectorService.selectAction(Number(processId));
    }
}
