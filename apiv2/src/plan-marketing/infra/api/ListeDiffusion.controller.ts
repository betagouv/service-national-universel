import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { ListeDiffusionService } from "@plan-marketing/core/service/ListeDiffusion.service";
import { CreateListeDiffusionDto, UpdateListeDiffusionDto } from "./ListeDiffusion.validation";
import { BasculerArchivageListeDiffusion } from "@plan-marketing/core/useCase/BasculerArchivageListeDiffusion";

@Controller("liste-diffusion")
export class ListeDiffusionController {
    constructor(
        private readonly listeDiffusionService: ListeDiffusionService,
        private readonly basculerArchivageListeDiffusion: BasculerArchivageListeDiffusion,
    ) {}

    @Post()
    async create(@Body() listeDiffusionDto: CreateListeDiffusionDto): Promise<ListeDiffusionModel> {
        return await this.listeDiffusionService.creerListeDiffusion(listeDiffusionDto);
    }

    @Get(":id")
    async getById(@Param("id") id: string): Promise<ListeDiffusionModel> {
        return await this.listeDiffusionService.getListeDiffusionById(id);
    }

    @Get()
    // TODO : add filter on archive and unarchive
    async search(@Query("sort") sort?: "ASC" | "DESC"): Promise<ListeDiffusionModel[]> {
        return await this.listeDiffusionService.searchListesDiffusion(undefined, sort);
    }

    @Put(":id")
    async update(@Param("id") id: string, @Body() updateListeDiffusionDto: UpdateListeDiffusionDto): Promise<ListeDiffusionModel | null> {
        return await this.listeDiffusionService.updateListeDiffusion(id, updateListeDiffusionDto);
    }

    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.listeDiffusionService.deleteListeDiffusion(id);
    }

    @Post(":id/toggle-archivage")
    async toggleArchivage(@Param("id") id: string): Promise<ListeDiffusionModel | null> {
        return await this.basculerArchivageListeDiffusion.execute(id);
    }
}
