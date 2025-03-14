import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
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
        await this.planMarketingActionSelectorService.selectAction(Number(processId));
    }
}
