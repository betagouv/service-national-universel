import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CampagneModel } from "../../core/Campagne.model";
import { CampagneGateway } from "../../core/gateway/Campagne.gateway";
import { CreateCampagneDto, UpdateCampagneDto } from "./Campagne.validation";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";

@Controller("campagne")
@UseGuards(AdminGuard)
export class CampagneController {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        private readonly campagneService: CampagneService,
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
        return await this.campagneService.updateCampagne(dto);
    }

    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.campagneGateway.delete(id);
    }
}
