import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    Request,
    ParseBoolPipe,
} from "@nestjs/common";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { CampagneModel, CampagneModelWithNomSession } from "../../core/Campagne.model";
import { ReferentModelLight } from "@admin/core/iam/Referent.model";
import { CampagneGateway } from "../../core/gateway/Campagne.gateway";
import { CreateCampagneDto, EnvoyerCampagneDto, UpdateCampagneDto } from "./Campagne.validation";
import { MettreAJourCampagne } from "@plan-marketing/core/useCase/MettreAJourCampagne";
import { PreparerEnvoiCampagne } from "@plan-marketing/core/useCase/PreparerEnvoiCampagne";
import { BasculerArchivageCampagne } from "@plan-marketing/core/useCase/BasculerArchivageCampagne";
import { PlanMarketingRoutes } from "snu-lib";
import { MettreAJourActivationProgrammationSpecifique } from "@plan-marketing/core/useCase/MettreAJourActivationProgrammationSpecifique";
import { CustomRequest } from "@shared/infra/CustomRequest";

@Controller("campagne")
@UseGuards(SuperAdminGuard)
export class CampagneController {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        private readonly campagneService: CampagneService,
        private readonly mettreAJourCampagne: MettreAJourCampagne,
        private readonly preparerEnvoiCampagne: PreparerEnvoiCampagne,
        private readonly basculerArchivageCampagne: BasculerArchivageCampagne,
        private readonly mettreAJourActivationProgrammationSpecifique: MettreAJourActivationProgrammationSpecifique,
    ) {}

    @Post()
    async create(@Body() dto: CreateCampagneDto): Promise<CampagneModel> {
        return await this.campagneService.creerCampagne(dto);
    }

    @Get(":id")
    async getById(@Param("id") id: string): Promise<CampagneModel> {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new Error("Campagne not found");
        }
        return campagne;
    }

    @Get(":id/campagnes-specifiques")
    async getCampagneSpecifiquesByCampagneGeneriqueId(
        @Param("id") campagneGeneriqueId: string,
    ): Promise<CampagneModelWithNomSession[]> {
        return await this.campagneService.findCampagneSpecifiquesByCampagneGeneriqueId(campagneGeneriqueId);
    }

    @Get()
    async search(
        @Query("generic", new ParseBoolPipe({ optional: true }))
        generic?: boolean,
        @Query("sort")
        sort?: "ASC" | "DESC",
        @Query("cohortId")
        cohortId?: string,
        @Query("isArchived", new ParseBoolPipe({ optional: true }))
        isArchived?: boolean,
        @Query("isProgrammationActive", new ParseBoolPipe({ optional: true }))
        isProgrammationActive?: boolean,
        @Query("isLinkedToGenericCampaign", new ParseBoolPipe({ optional: true }))
        isLinkedToGenericCampaign?: boolean,
    ): Promise<CampagneModel[]> {
        return await this.campagneService.search({
            generic,
            cohortId,
            isArchived,
            isProgrammationActive,
            isLinkedToGenericCampaign,
        }, sort);
    }

    @Put(":id")
    async update(@Param("id") id: string, @Body() dto: UpdateCampagneDto): Promise<CampagneModel | null> {
        return await this.mettreAJourCampagne.execute(dto);
    }

    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.campagneGateway.delete(id);
    }

    @Post(":id/envoyer")
    async envoyerCampagne(
        @Param("id") campagneId: string,
        @Body() dto: EnvoyerCampagneDto,
    ): Promise<PlanMarketingRoutes["EnvoyerPlanMarketingRoute"]["response"]> {
        await this.mettreAJourActivationProgrammationSpecifique.execute(campagneId, dto.isProgrammationActive);
        return await this.preparerEnvoiCampagne.execute(campagneId);
    }

    @Post(":id/toggle-archivage")
    async toggleArchivage(@Param("id") id: string): Promise<CampagneModel | null> {
        return await this.basculerArchivageCampagne.execute(id);
    }

    @Post(":id/envoyer-email-test")
    async envoyerTest(
        @Request() request: CustomRequest,
        @Param("id") campagneId: string,
    ): Promise<PlanMarketingRoutes["EnvoyerEmailTestPlanMarketingRoute"]["response"]> {
        if (!request.user.email) {
            throw new Error("User email is required for sending test emails");
        }
        const destinataire: ReferentModelLight = {
            id: request.user.id || "id",
            prenom: request.user.prenom || "Prenom",
            nom: request.user.nom || "Nom",
            email: request.user.email,
        };
        return await this.campagneService.sendMailTest(campagneId, destinataire);
    }
}
