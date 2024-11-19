import { Controller, Get, Param, Query } from "@nestjs/common";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { FindClassePourPublic } from "../../../../../core/sejours/cle/classe/useCase/FindClassePourPublic";

@Controller("classe/public")
export class ClasseController {
    constructor(private readonly findClassePourPublic: FindClassePourPublic) {}

    @Get(":id")
    findAll(@Param("id") id: string, @Query("withDetails") withDetails: boolean): Promise<ClasseModel> {
        return this.findClassePourPublic.execute(id, withDetails);
    }
}
