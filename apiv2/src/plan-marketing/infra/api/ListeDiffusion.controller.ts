import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ImporterContacts } from "../../core/useCase/ImporterContacts";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";

@Controller("plan-marketing/liste-diffusion")
export class CreerListeDiffusionController {
    constructor(private readonly creerListeDiffusion: ImporterContacts) {}

    @UseGuards(AdminGuard)
    @Post()
    async creer(@Body("nom") nom: string, @Body("campagneId") campagneId: string) {
        await this.creerListeDiffusion.execute(nom, campagneId);
    }

    // TODO: finir webhook
    async webhook(@Body("processId") processId: string) {
        // await this.creerListeDiffusion.execute(processId);
    }
}
