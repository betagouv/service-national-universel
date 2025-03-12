import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { CampagneModel } from "../../core/Campagne.model";
import { CampagneGateway } from "../../core/gateway/Campagne.gateway";
import { CreateCampagneDto, UpdateCampagneDto } from "./Campagne.validation";
import { MettreAJourCampagne } from "@plan-marketing/core/useCase/MettreAJourCampagne";

@Controller("campagne")
@UseGuards(SuperAdminGuard)
export class CampagneController {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        private readonly campagneService: CampagneService,
        private readonly mettreAJourCampagne: MettreAJourCampagne,
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
    ): Promise<CampagneModel[]> {
        return await this.campagneGateway.search({ generic }, sort);
    }

    @Put(":id")
    async update(@Param("id") id: string, @Body() dto: UpdateCampagneDto): Promise<CampagneModel | null> {
        return await this.mettreAJourCampagne.execute(dto);
        // return await this.campagneService.updateCampagne(dto);
    }

    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.campagneGateway.delete(id);
    }
}
