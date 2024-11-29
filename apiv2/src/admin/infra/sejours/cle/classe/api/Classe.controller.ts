import {
    ModifierReferentClasse,
    ModifierReferentClasseModel,
} from "@admin/core/sejours/cle/classe/useCase/modifierReferentClasse/ModifierReferentClasse";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseService } from "../../../../../core/sejours/cle/classe/Classe.service";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly classeService: ClasseService,
        private readonly modifierReferentClasse: ModifierReferentClasse,
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

    @Post(":id/referent/modifier-ou-creer")
    @UseGuards(ClasseAdminCleGuard)
    async modifierReferent(
        @Param("id") classeId: string,
        @Body() modifierReferentClasse: ModifierReferentClasseModel,
    ): Promise<ModifierReferentClasseModel> {
        const referent = await this.modifierReferentClasse.execute(classeId, modifierReferentClasse);
        return {
            email: referent.email,
            prenom: referent.prenom,
            nom: referent.nom,
        };
    }
}
