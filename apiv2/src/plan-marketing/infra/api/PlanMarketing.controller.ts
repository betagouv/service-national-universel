import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ImporterEtCreerListeDiffusion } from "../../core/useCase/ImporterEtCreerListeDiffusion";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { BrevoIpGuard } from "../guard/BrevoIpGuard";
import { IsString, IsNotEmpty } from "class-validator";

class ImporterContactsEtCreerListeDiffusionDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    campagneId: string;
}

@Controller("plan-marketing")
export class PlanMarketingController {
    constructor(private readonly importerEtCreerListeDiffusion: ImporterEtCreerListeDiffusion) {}

    @UseGuards(AdminGuard)
    @Post("liste-diffusion")
    async creer(@Body() dto: ImporterContactsEtCreerListeDiffusionDto) {
        await this.importerEtCreerListeDiffusion.execute(dto.nom, dto.campagneId);
    }

    @Post("import/webhook")
    @UseGuards(BrevoIpGuard)
    async webhook(@Body("processId") processId: string) {
        // await this.creerListeDiffusion.execute(processId);
    }
}
