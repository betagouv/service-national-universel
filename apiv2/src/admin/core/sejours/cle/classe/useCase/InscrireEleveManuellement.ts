import { JeuneModel, JeuneWithMinimalDataModel } from "@admin/core/sejours/jeune/Jeune.model";
import { JeuneService } from "@admin/core/sejours/jeune/Jeune.service";
import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { ClasseService } from "../Classe.service";
import { FunctionalException } from "@shared/core/FunctionalException";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { YOUNG_STATUS } from "snu-lib";

@Injectable()
export class InscrireEleveManuellement implements UseCase<JeuneModel> {
    constructor(
        private readonly jeuneService: JeuneService,
        private readonly classeService: ClasseService,
    ) {}

    async execute(jeune: JeuneWithMinimalDataModel, classeId: string): Promise<JeuneModel> {
        const classe = await this.classeService.findById(classeId);

        // Place disponible dans la classe
        const maxJeune = classe.placesTotal || 100;
        if (classe.placesPrises + 1 > maxJeune) {
            throw new FunctionalException(FunctionalExceptionCode.CLASSE_FULL);
        }

        // Vérifier si le jeune existe déjà
        const existingJeune = await this.jeuneService.findByPrenomAndNomDateNaissanceAndClasseId(
            jeune.prenom,
            jeune.nom,
            jeune.dateNaissance,
            classeId,
        );
        if (existingJeune) {
            throw new FunctionalException(FunctionalExceptionCode.JEUNE_ALREADY_EXISTS);
        }

        // TODO: Contrôle sur le statut de la classe ?
        // => RG : Validation automatique du dossier après inscription

        const jeuneToCreate = this.jeuneService.buildJeuneCleWithMinimalData(jeune, classe);
        const createdJeune = await this.jeuneService.create(jeuneToCreate);
        await this.jeuneService.update({
            ...createdJeune,
            statut: YOUNG_STATUS.VALIDATED,
        });
        return createdJeune;
    }
}
