import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseService } from "../../../../../core/sejours/cle/classe/Classe.service";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly classeService: ClasseService,
    ) {}

    // TODO : remove after testing
    @Get("/")
    @UseGuards(SuperAdminGuard)
    findAll(): Promise<ClasseModel[]> {
        return this.classeService.findAll();
    }

    @Post(":id/verify")
    @UseGuards(ClasseAdminCleGuard)
    verify(@Param("id") id: string): Promise<ClasseModel> {
        return this.verifierClasse.execute(id);
    }
}
