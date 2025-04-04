import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { CampagneModel } from "../../core/Campagne.model";
import { CampagneGateway } from "../../core/gateway/Campagne.gateway";
import { CreateCampagneDto, UpdateCampagneDto } from "./Campagne.validation";
import { MettreAJourCampagne } from "@plan-marketing/core/useCase/MettreAJourCampagne";
import { PreparerEnvoiCampagne } from "@plan-marketing/core/useCase/PreparerEnvoiCampagne";
import { PlanMarketingRoutes } from "snu-lib";

@Controller("campagne")
@UseGuards(SuperAdminGuard)
export class CampagneController {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        private readonly campagneService: CampagneService,
        private readonly mettreAJourCampagne: MettreAJourCampagne,
        private readonly preparerEnvoiCampagne: PreparerEnvoiCampagne,
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

    @Get()
    async search(
        @Query("generic")
        generic?: boolean,
        @Query("sort")
        sort?: "ASC" | "DESC",
        @Query("cohortId")
        cohortId?: string,
    ): Promise<CampagneModel[]> {
        return await this.campagneGateway.search({ generic, cohortId }, sort);
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
    ): Promise<PlanMarketingRoutes["EnvoyerPlanMarketingRoute"]["response"]> {
        return await this.preparerEnvoiCampagne.execute(campagneId);
    }
}
