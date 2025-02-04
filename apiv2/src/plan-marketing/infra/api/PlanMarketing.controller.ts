import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ImporterEtCreerListeDiffusion } from "../../core/useCase/ImporterEtCreerListeDiffusion";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { BrevoIpGuard } from "../guard/BrevoIpGuard";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";
import { PlanMarketingActionSelectorService } from "@plan-marketing/core/PlanMarketingActionSelector.service";

class ImporterContactsEtCreerListeDiffusionDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    campagneId: string;

    @IsNotEmpty()
    @IsNumber()
    folderId: number;

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
        await this.importerEtCreerListeDiffusion.execute(dto.nom, dto.campagneId, dto.folderId, dto.pathFile);
    }

    @Post("import/webhook")
    @UseGuards(BrevoIpGuard)
    async webhook(@Body("id") processId: number) {
        await this.planMarketingActionSelectorService.selectAction(processId);
    }
}
