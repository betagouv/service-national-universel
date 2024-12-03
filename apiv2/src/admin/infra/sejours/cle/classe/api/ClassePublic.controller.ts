import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { FindClassePourPublic } from "../../../../../core/sejours/cle/classe/useCase/FindClassePourPublic";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";

@Controller("classe/public")
export class ClasseController {
    constructor(private readonly findClassePourPublic: FindClassePourPublic) {}

    // TODO : remove guards after adding specific mapper
    @Get(":id")
    @UseGuards(SuperAdminGuard)
    findAll(@Param("id") id: string, @Query("withDetails") withDetails: boolean): Promise<ClasseModel> {
        return this.findClassePourPublic.execute(id, withDetails);
    }
}
