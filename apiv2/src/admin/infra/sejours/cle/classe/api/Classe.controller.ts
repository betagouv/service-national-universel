import { ModifierReferentClasse } from "@admin/core/sejours/cle/classe/useCase/modifierReferentClasse/ModifierReferentClasse";
import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ClasseWithReferentsModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";
import { ClassesRoutes, FeatureFlagName, ModifierReferentDto } from "snu-lib";
import { InscriptionManuellePayloadDto, ModifierReferentPayloadDto } from "./Classe.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FeatureFlagService } from "@shared/core/featureFlag/FeatureFlag.service";
import { InscrireEleveManuellement } from "@admin/core/sejours/cle/classe/useCase/InscrireEleveManuellement";
import { JeuneWithMinimalDataModel } from "@admin/core/sejours/jeune/Jeune.model";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly modifierReferentClasse: ModifierReferentClasse,
        private readonly featureFlagService: FeatureFlagService,
        private readonly inscrireEleveManuellement: InscrireEleveManuellement,
    ) {}

    @Post(":id/verify")
    @UseGuards(ClasseAdminCleGuard)
    verify(@Param("id") id: string): Promise<ClasseWithReferentsModel> {
        return this.verifierClasse.execute(id);
    }

    @Post(":id/referent/modifier-ou-creer")
    @UseGuards(ClasseAdminCleGuard)
    async modifierReferent(
        @Param("id") classeId: string,
        @Body() modifierReferentClasse: ModifierReferentPayloadDto,
    ): Promise<ModifierReferentDto> {
        const referent = await this.modifierReferentClasse.execute(classeId, modifierReferentClasse);
        return {
            id: referent.id,
            email: referent.email,
            prenom: referent.prenom,
            nom: referent.nom,
        };
    }

    @Post(":id/inscription-manuelle")
    @UseGuards(ClasseAdminCleGuard)
    async inscriptionManuelle(
        @Param("id") classeId: string,
        @Body() data: InscriptionManuellePayloadDto,
    ): Promise<ClassesRoutes["InscriptionManuelle"]["response"]> {
        await this.assertInscriptionElevesEnabled();
        const jeune: JeuneWithMinimalDataModel = {
            prenom: data.prenom.trim(),
            nom: data.nom.trim(),
            dateNaissance: data.dateDeNaissance,
            genre: data.sexe,
        };
        return this.inscrireEleveManuellement.execute(jeune, classeId);
    }

    // L'inscription manuelle d'élèves a été retirée de l'admin avec le décommissionnement CLE
    // (cf. FM10) ; l'inscription en masse est supprimée (lot O2, M75).
    private async assertInscriptionElevesEnabled(): Promise<void> {
        const isEnabled = await this.featureFlagService.isFeatureFlagEnabled(
            FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE,
        );
        if (!isEnabled) {
            throw new FunctionalException(
                FunctionalExceptionCode.FEATURE_FLAG_NOT_ENABLED,
                "Inscription en masse is not enabled",
            );
        }
    }
}
