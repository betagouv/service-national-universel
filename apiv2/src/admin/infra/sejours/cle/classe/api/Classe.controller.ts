import { Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseService } from "../../../../../core/sejours/cle/classe/Classe.service";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly classeService: ClasseService,
    ) {}

    @Get("/")
    findAll(): Promise<ClasseModel[]> {
        return this.classeService.findAll();
    }

    @Put(":id/verify")
    @UseGuards(ClasseAdminCleGuard)
    verify(@Param("id") id: string): Promise<ClasseModel> {
        return this.verifierClasse.execute(id);
    }
}
